import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../shared/context/AuthContext';
import {
  useServices,
  useServiceCategories,
  useCreateService,
  useUpdateService,
  useDeleteService,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from './hooks';
import type { Service, ServiceCategory } from './types';

interface ServiceFormValues {
  name: string;
  durationMinutes: number;
  price: number;
  categoryId: string;
  description: string;
  color: string;
  isActive: boolean;
}

interface CategoryFormValues {
  name: string;
  description: string;
  displayOrder: number;
}

const emptyServiceForm: ServiceFormValues = {
  name: '',
  durationMinutes: 60,
  price: 0,
  categoryId: '',
  description: '',
  color: '#B8862B',
  isActive: true,
};

function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value);
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr${h > 1 ? 's' : ''}`;
  return `${h}h ${m}m`;
}

export function AdminServicesPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles.includes('Admin') ?? false;

  const [includeInactive, setIncludeInactive] = useState(false);
  const [serviceModal, setServiceModal] = useState<{ open: boolean; editing?: Service }>({ open: false });
  const [categoryModal, setCategoryModal] = useState<{ open: boolean; editing?: ServiceCategory }>({ open: false });
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'service' | 'category'; id: string; name: string } | null>(null);

  const { data: services, isLoading: servicesLoading, isError: servicesError } = useServices(includeInactive);
  const { data: categories } = useServiceCategories();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const serviceForm = useForm<ServiceFormValues>({ defaultValues: emptyServiceForm });
  const categoryForm = useForm<CategoryFormValues>({ defaultValues: { name: '', description: '', displayOrder: 0 } });

  const openCreateService = () => {
    serviceForm.reset(emptyServiceForm);
    setServiceModal({ open: true });
  };

  const openEditService = (service: Service) => {
    serviceForm.reset({
      name: service.name,
      durationMinutes: service.durationMinutes,
      price: service.price,
      categoryId: service.categoryId ?? '',
      description: service.description ?? '',
      color: service.color ?? '#B8862B',
      isActive: service.isActive,
    });
    setServiceModal({ open: true, editing: service });
  };

  const onServiceSubmit = serviceForm.handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      durationMinutes: Number(values.durationMinutes),
      price: Number(values.price),
      categoryId: values.categoryId || null,
      description: values.description || null,
      color: values.color || null,
      isActive: values.isActive,
      displayOrder: 0,
    };
    if (serviceModal.editing) {
      await updateService.mutateAsync({ id: serviceModal.editing.id, payload });
    } else {
      await createService.mutateAsync(payload);
    }
    setServiceModal({ open: false });
  });

  const openCreateCategory = () => {
    categoryForm.reset({ name: '', description: '', displayOrder: 0 });
    setCategoryModal({ open: true });
  };

  const openEditCategory = (category: ServiceCategory) => {
    categoryForm.reset({ name: category.name, description: category.description ?? '', displayOrder: category.displayOrder });
    setCategoryModal({ open: true, editing: category });
  };

  const onCategorySubmit = categoryForm.handleSubmit(async (values) => {
    const payload = { name: values.name, description: values.description || null, displayOrder: values.displayOrder };
    if (categoryModal.editing) {
      await updateCategory.mutateAsync({ id: categoryModal.editing.id, payload });
    } else {
      await createCategory.mutateAsync(payload);
    }
    setCategoryModal({ open: false });
  });

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'service') await deleteService.mutateAsync(deleteTarget.id);
    else await deleteCategory.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen bg-paper py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink">Services</h1>
            <p className="text-slate mt-1">Manage what you offer, pricing, and categories</p>
          </div>
          {isAdmin && (
            <div className="flex gap-3">
              <button onClick={openCreateCategory} className="btn-secondary text-sm">New Category</button>
              <button onClick={openCreateService} className="btn-primary text-sm">New Service</button>
            </div>
          )}
        </div>

        {isAdmin && (
          <div className="mb-6">
            <label className="inline-flex items-center gap-2 text-sm text-slate cursor-pointer">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                className="w-4 h-4 accent-brass"
              />
              Show inactive services
            </label>
          </div>
        )}

        {/* Services list */}
        {servicesLoading && (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-5 bg-ink/10 rounded w-1/3 mb-3" />
                <div className="h-4 bg-ink/10 rounded w-1/4" />
              </div>
            ))}
          </div>
        )}

        {servicesError && (
          <div className="card border-red-200 bg-red-50 text-red-700" role="alert">
            Failed to load services. Please try again.
          </div>
        )}

        {!servicesLoading && !servicesError && services && services.length === 0 && (
          <div className="card text-center py-16">
            <h2 className="font-display text-xl font-semibold text-ink">No services yet</h2>
            <p className="text-slate mt-2 mb-6">Add your first service to start taking bookings.</p>
            {isAdmin && (
              <button onClick={openCreateService} className="btn-primary text-sm">
                Add your first service
              </button>
            )}
          </div>
        )}

        {!servicesLoading && !servicesError && services && services.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className={`card hover:shadow-lg transition-shadow ${!service.isActive ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <span
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-paper-white font-display font-bold text-lg shrink-0"
                    style={{ backgroundColor: service.color || '#B8862B' }}
                    aria-hidden="true"
                  >
                    {service.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditService(service)}
                      className="text-slate hover:text-ink transition-colors p-1"
                      aria-label={`Edit ${service.name}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => setDeleteTarget({ type: 'service', id: service.id, name: service.name })}
                        className="text-slate hover:text-red-600 transition-colors p-1"
                        aria-label={`Delete ${service.name}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <h2 className="font-display text-lg font-semibold text-ink mb-1">{service.name}</h2>
                {service.categoryName && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-brass/10 text-brass text-xs font-medium mb-2">
                    {service.categoryName}
                  </span>
                )}
                <p className="text-slate text-sm line-clamp-2 mb-4">{service.description || 'No description'}</p>

                <div className="flex items-center justify-between pt-4 border-t border-line">
                  <span className="text-sm text-slate">{formatDuration(service.durationMinutes)}</span>
                  <span className="font-display font-bold text-ink">{formatPrice(service.price)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Categories section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-semibold text-ink">Categories</h2>
            {isAdmin && (
              <button onClick={openCreateCategory} className="btn-secondary text-sm">
                New Category
              </button>
            )}
          </div>

          {(!categories || categories.length === 0) && (
            <p className="text-slate text-sm">No categories yet. Group your services to make browsing easier.</p>
          )}

          {categories && categories.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="card flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-medium text-ink truncate">{category.name}</h3>
                    <p className="text-sm text-slate">{category.serviceCount} service{category.serviceCount === 1 ? '' : 's'}</p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => openEditCategory(category)}
                        className="text-slate hover:text-ink p-1 transition-colors"
                        aria-label={`Edit ${category.name}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: 'category', id: category.id, name: category.name })}
                        className="text-slate hover:text-red-600 p-1 transition-colors"
                        aria-label={`Delete ${category.name}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Service modal */}
      {serviceModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60" role="dialog" aria-modal="true" aria-label="Service form">
          <div className="bg-paper-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-line flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-ink">
                {serviceModal.editing ? 'Edit Service' : 'New Service'}
              </h2>
              <button onClick={() => setServiceModal({ open: false })} className="text-slate hover:text-ink p-1" aria-label="Close">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={onServiceSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="service-name" className="label-field">Service Name</label>
                <input id="service-name" {...serviceForm.register('name', { required: 'Name is required' })} className="input-field" placeholder="e.g. Signature Manicure" />
                {serviceForm.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-600" role="alert">{serviceForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="service-duration" className="label-field">Duration (minutes)</label>
                  <input
                    id="service-duration"
                    type="number"
                    min={5}
                    step={5}
                    {...serviceForm.register('durationMinutes', { required: 'Required', min: { value: 5, message: 'Min 5 min' } })}
                    className="input-field"
                  />
                  {serviceForm.formState.errors.durationMinutes && (
                    <p className="mt-1 text-sm text-red-600" role="alert">{serviceForm.formState.errors.durationMinutes.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="service-price" className="label-field">Price (₱)</label>
                  <input
                    id="service-price"
                    type="number"
                    min={0}
                    step={0.01}
                    {...serviceForm.register('price', { required: 'Required', min: { value: 0, message: 'Min 0' } })}
                    className="input-field"
                  />
                  {serviceForm.formState.errors.price && (
                    <p className="mt-1 text-sm text-red-600" role="alert">{serviceForm.formState.errors.price.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="service-category" className="label-field">Category</label>
                <select id="service-category" {...serviceForm.register('categoryId')} className="input-field">
                  <option value="">No category</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="service-description" className="label-field">Description</label>
                <textarea
                  id="service-description"
                  rows={3}
                  {...serviceForm.register('description')}
                  className="input-field resize-none"
                  placeholder="What's included?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 items-end">
                <div>
                  <label htmlFor="service-color" className="label-field">Color</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" {...serviceForm.register('color')} className="w-10 h-10 rounded border border-line bg-paper-white" aria-label="Service color" />
                    <span className="text-sm text-slate font-mono">{serviceForm.watch('color')}</span>
                  </div>
                </div>
                <label className="inline-flex items-center gap-2 text-sm text-slate cursor-pointer mb-2">
                  <input type="checkbox" {...serviceForm.register('isActive')} className="w-4 h-4 accent-brass" />
                  Active
                </label>
              </div>

              {(createService.isError || updateService.isError) && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm" role="alert">
                  Failed to save service. Please try again.
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setServiceModal({ open: false })}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={createService.isPending || updateService.isPending}
                >
                  {createService.isPending || updateService.isPending ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category modal */}
      {categoryModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60" role="dialog" aria-modal="true" aria-label="Category form">
          <div className="bg-paper-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-line flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-ink">
                {categoryModal.editing ? 'Edit Category' : 'New Category'}
              </h2>
              <button onClick={() => setCategoryModal({ open: false })} className="text-slate hover:text-ink p-1" aria-label="Close">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={onCategorySubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="category-name" className="label-field">Category Name</label>
                <input id="category-name" {...categoryForm.register('name', { required: 'Name is required' })} className="input-field" placeholder="e.g. Nails" />
                {categoryForm.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-600" role="alert">{categoryForm.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="category-description" className="label-field">Description</label>
                <input id="category-description" {...categoryForm.register('description')} className="input-field" placeholder="Optional" />
              </div>
              <div>
                <label htmlFor="category-order" className="label-field">Display Order</label>
                <input id="category-order" type="number" min={0} {...categoryForm.register('displayOrder')} className="input-field" />
              </div>

              {(createCategory.isError || updateCategory.isError) && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm" role="alert">
                  Failed to save category. Please try again.
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setCategoryModal({ open: false })} className="btn-secondary flex-1">Cancel</button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={createCategory.isPending || updateCategory.isPending}
                >
                  {createCategory.isPending || updateCategory.isPending ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60" role="dialog" aria-modal="true" aria-label="Confirm delete">
          <div className="bg-paper-white rounded-xl w-full max-w-sm shadow-2xl p-6">
            <h2 className="font-display text-lg font-semibold text-ink mb-2">Delete {deleteTarget.type === 'service' ? 'service' : 'category'}</h2>
            <p className="text-slate text-sm mb-6">
              Are you sure you want to delete <span className="font-medium text-ink">"{deleteTarget.name}"</span>? This can't be undone.
            </p>
            {(deleteService.isError || deleteCategory.isError) && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4" role="alert">
                Failed to delete. Please try again.
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={confirmDelete}
                className="btn-danger flex-1"
                disabled={deleteService.isPending || deleteCategory.isPending}
              >
                {deleteService.isPending || deleteCategory.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}