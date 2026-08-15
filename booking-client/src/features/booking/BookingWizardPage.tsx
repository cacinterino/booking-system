import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { publicBookingApi } from './api';
import { bookingKeys, usePublicBusiness, usePublicServices, usePublicStaff } from './hooks';
import { ServiceStep } from './components/ServiceStep';
import { StaffStep } from './components/StaffStep';
import { DateTimeStep } from './components/DateTimeStep';
import { DetailsStep } from './components/DetailsStep';
import { ConfirmationStep } from './components/ConfirmationStep';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';
import type { AvailableSlot, BookingResponse, PublicStaff } from './types';
import type { Service as ServiceType } from '../services/types';

const STEPS = ['Service', 'Staff', 'Date & time', 'Your details'];

function extractDetail(error: unknown): string | null {
  if (typeof error === 'object' && error !== null) {
    const err = error as { response?: { data?: { detail?: string } } };
    if (err.response?.data?.detail) return err.response.data.detail;
  }
  return null;
}

function LookupMyBooking({ slug }: { slug: string }) {
  const [code, setCode] = useState('');
  const [searched, setSearched] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-bookings', slug, searched],
    queryFn: () => publicBookingApi.getMyBookings(searched, true),
    enabled: searched.length > 0,
    retry: false,
  });

  return (
    <div className="mt-12 ticket-plain">
      <p className="font-mono text-xs uppercase tracking-widest text-brass">Have a booking already?</p>
      <h3 className="mt-1 font-display text-lg font-semibold text-ink">Look it up with your access code</h3>
      <form
        className="mt-4 flex flex-col sm:flex-row gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (code.trim()) {
            setSearched(code.trim());
            queryClient.invalidateQueries({ queryKey: ['my-bookings', slug, code.trim()] });
          }
        }}
      >
        <input
          type="text"
          className="input-field sm:flex-1"
          placeholder="e.g. 8F3K-2Q7X"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          aria-label="Access code"
        />
        <button type="submit" className="btn-secondary">
          View my booking
        </button>
      </form>

      {isLoading && <p className="mt-3 text-sm text-slate">Looking up…</p>}
      {isError && <p className="mt-3 text-sm text-red-600">No booking found for that code.</p>}
      {data && data.length === 0 && !isLoading && !isError && (
        <p className="mt-3 text-sm text-slate">No upcoming bookings for that code.</p>
      )}
      {data && data.length > 0 && (
        <ul className="mt-4 space-y-3">
          {data.map((booking) => (
            <li key={booking.id} className="p-4 rounded-lg border border-line bg-paper">
              <p className="font-display font-semibold text-ink">{booking.serviceName}</p>
              <p className="mt-1 text-sm text-slate">with {booking.staffName}</p>
              <p className="mt-1 text-sm text-ink-soft">
                {new Date(booking.startTime).toLocaleString('en-PH', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function BookingWizardPage() {
  const { businessSlug = '' } = useParams();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [service, setService] = useState<ServiceType | null>(null);
  const [staff, setStaff] = useState<PublicStaff | null>(null);
  const [slot, setSlot] = useState<AvailableSlot | null>(null);
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);

  const idempotencyKey = useRef('');
  useEffect(() => {
    idempotencyKey.current = crypto.randomUUID();
  }, []);

  const businessQuery = usePublicBusiness(businessSlug);
  const servicesQuery = usePublicServices(businessSlug);
  const staffQuery = usePublicStaff(businessSlug, service?.id, !!service);

  const business = businessQuery.data;
  const services = servicesQuery.data;
  const staffList = staffQuery.data;

  const resetAfterService = (s: ServiceType) => {
    setService(s);
    setStaff(null);
    setSlot(null);
    setConflict(false);
    setStep(1);
  };

  const handleConfirm = async (contact: { name: string; email: string; phone?: string; notes?: string }) => {
    if (!business || !service || !staff || !slot) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await publicBookingApi.createBooking(
        {
          businessId: business.id,
          serviceId: service.id,
          staffId: staff.id,
          startTime: slot.startUtc,
          notes: contact.notes ?? null,
          guestContact: { name: contact.name, email: contact.email, phone: contact.phone ?? null },
        },
        idempotencyKey.current,
      );
      setBooking(created);
      setStep(4);
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (status === 409) {
        setConflict(true);
        setStep(2);
      } else {
        setSubmitError(extractDetail(err) ?? 'Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleTakenRefresh = () => {
    setConflict(false);
    setSlot(null);
    if (service) {
      queryClient.invalidateQueries({ queryKey: bookingKeys.availability(businessSlug, service.id, '') });
    }
  };

  const notFound = businessQuery.isError;
  const noServices = !notFound && !!services && services.length === 0;

  const eyebrow = business?.name ?? 'Booked.';

  if (businessQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <LoadingSpinner />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper px-4">
        <div className="ticket text-center max-w-md w-full">
          <p className="font-mono text-xs uppercase tracking-widest text-brass">Page not found</p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink">We couldn't find that business</h1>
          <p className="mt-3 text-ink-soft">The booking link may be out of date. Check the address and try again.</p>
          <Link to="/" className="btn-primary mt-6">
            Back to Booked.
          </Link>
        </div>
      </div>
    );
  }

  if (noServices) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper px-4">
        <div className="ticket text-center max-w-md w-full">
          <p className="font-mono text-xs uppercase tracking-widest text-brass">{eyebrow}</p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink">No services available yet</h1>
          <p className="mt-3 text-ink-soft">This business hasn't published any services. Check back soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-paper-white/90 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="font-display text-xl font-bold text-ink">
              Booked<span className="text-brass">.</span>
            </Link>
            <Link to="/my-bookings" className="font-mono text-xs uppercase tracking-widest text-slate hover:text-ink transition-colors">
              My bookings
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 sm:px-6 pb-20">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-widest text-brass">{eyebrow}</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink">
            {step === 4 ? 'Booking confirmed' : 'Book an appointment'}
          </h1>
          {business?.description && !service && step === 0 && (
            <p className="mt-2 text-ink-soft">{business.description}</p>
          )}
        </div>

        {step < 4 && (
          <nav className="mb-8" aria-label="Progress">
            <ol className="flex flex-wrap gap-2">
              {STEPS.map((label, i) => (
                <li key={label} className="flex items-center gap-2">
                  <span
                    className={`font-mono text-xs px-2.5 py-1 rounded-full border ${
                      i === step
                        ? 'bg-brass text-paper-white border-brass'
                        : i < step
                          ? 'border-line bg-paper-white text-ink'
                          : 'border-line text-slate'
                    }`}
                  >
                    {label}
                  </span>
                  {i < STEPS.length - 1 && <span className="text-line">·</span>}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {step === 0 && <ServiceStep services={services ?? []} selectedId={service?.id} onSelect={resetAfterService} />}

        {step === 1 && staffList && (
          <>
            <StaffStep staff={staffList} selectedId={staff?.id} onSelect={(s) => {
              setStaff(s);
              setSlot(null);
              setConflict(false);
              setStep(2);
            }} />
            <div className="mt-6">
              <button type="button" onClick={() => setStep(0)} className="btn-secondary">
                Back
              </button>
            </div>
          </>
        )}

        {step === 2 && business && service && (
          <>
            {conflict && (
              <div className="mb-6 p-4 rounded-lg border border-red-300 bg-red-50 text-red-700">
                <p className="font-medium">That slot just got taken.</p>
                <p className="mt-1 text-sm">
                  Another guest booked it first. Pick a fresh time below — {slot ? 'your previous pick is no longer available' : 'new times are shown'}.
                </p>
              </div>
            )}
            <DateTimeStep
              slug={businessSlug}
              serviceId={service.id}
              serviceName={service.name}
              staffId={staff?.id}
              advanceBookingDays={business.advanceBookingDays}
              selectedSlot={slot ?? undefined}
              onSelectSlot={(s) => {
                setSlot(s);
                setConflict(false);
                setStep(3);
              }}
            />
            <div className="mt-6">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                Back
              </button>
            </div>
          </>
        )}

        {step === 3 && business && (
          <>
            {slot && service && (
              <div className="mb-6 ticket-plain">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-display font-semibold text-ink">{service.name}</p>
                    <p className="mt-1 text-sm text-slate">with {staff?.fullName}</p>
                  </div>
                  <p className="font-mono text-sm font-medium text-ink">
                    {new Date(slot.startUtc + 'Z').toLocaleString('en-PH', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                      timeZone: 'Asia/Manila',
                    })}
                  </p>
                </div>
              </div>
            )}
            <DetailsStep business={business} onConfirm={handleConfirm} submitting={submitting} error={submitError} />
            <div className="mt-6">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary" disabled={submitting}>
                Back
              </button>
            </div>
          </>
        )}

        {step === 4 && booking && (
          <>
            <ConfirmationStep booking={booking} />
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/" className="btn-secondary">
                Back to Booked.
              </Link>
              <button type="button" onClick={handleTakenRefresh} className="btn-primary">
                Book another appointment
              </button>
            </div>
          </>
        )}

        {step === 4 && <LookupMyBooking slug={businessSlug} />}
      </main>
    </div>
  );
}
