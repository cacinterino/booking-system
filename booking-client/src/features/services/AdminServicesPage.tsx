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
import { Card, Badge, Button, SectionHeader, EmptyState, LoadingSkeleton, Modal } from '../../shared/ui';
import { formatPhp } from '../booking/format';

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
    };

    if (serviceModal.editing) {
      await updateService.mutateAsync({ id: serviceModal.editing.id, payload });
    } else {
      await createService.mutateAsync(payload);
    }
    setServiceModal({ open: false });
  });

  const openCreateCategory = () => {
    categoryForm.reset({ name: '', description: '', displayOrder: (categories?.length ?? 0) + 1 });
    setCategoryModal({ open: true });
  };

  const openEditCategory = (category: ServiceCategory) => {
    categoryForm.reset({
      name: category.name,
      description: category.description ?? '',
      displayOrder: category.displayOrder,
    });
    setCategoryModal({ open: true, editing: category });
  };

  const onCategorySubmit = categoryForm.handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      description: values.description || null,
      displayOrder: Number(values.displayOrder),
    };

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
    <div className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-line">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-brass-deep mb-1.5">
              Offerings &amp; Catalog
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink">
              Services &amp; Pricing
            </h1>
            <p className="text-slate text-sm sm:text-base mt-1">
              Configure available service offerings, durations, and pricing in Philippine Pesos.
            </p>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-3">
              <Button onClick={openCreateCategory} variant="secondary" size="sm">
                New Category
              </Button>
              <Button onClick={openCreateService} variant="primary" size="sm">
                + New Service
              </Button>
            </div>
          )}
        </div>

        {isAdmin && (
          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-xs font-mono uppercase text-slate cursor-pointer">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                className="w-4 h-4 rounded border-line text-brass focus:ring-brass"
              />
              Show archived / inactive services
            </label>
          </div>
        )}

        {/* Services List */}
        {servicesLoading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <LoadingSkeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        )}

        {servicesError && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm" role="alert">
            Failed to load services. Please refresh your browser or try again later.
          </div>
        )}

        {!servicesLoading && !servicesError && services && services.length === 0 && (
          <Card>
            <EmptyState
              title="No services added yet"
              description="Add your first service to enable customers to book appointments online."
              icon={
                <svg className="w-8 h-8 text-brass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
              action={
                isAdmin && (
                  <Button onClick={openCreateService} variant="primary" size="sm">
                    Add your first service
                  </Button>
                )
              }
            />
          </Card>
        )}

        {!servicesLoading && !servicesError && services && services.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card
                key={service.id}
                className={`flex flex-col justify-between ${!service.isActive ? 'opacity-60 bg-paper/30' : ''}`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-paper-white font-display font-bold text-lg shrink-0 shadow-xs"
                      style={{ backgroundColor: service.color || '#B8862B' }}
                      aria-hidden="true"
                    >
                      {service.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditService(service)}
                        className="text-slate hover:text-ink transition-colors p-1.5 rounded-md hover:bg-ink/5"
                        aria-label={`Edit ${service.name}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => setDeleteTarget({ type: 'service', id: service.id, name: service.name })}
                          className="text-slate hover:text-red-600 transition-colors p-1.5 rounded-md hover:bg-red-50"
                          aria-label={`Delete ${service.name}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="font-display text-lg font-bold text-ink">
                    {service.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 mt-1 mb-2">
                    {service.categoryName && (
                      <Badge variant="brass">
                        {service.categoryName}
                      </Badge>
                    )}
                    {!service.isActive && (
                      <Badge variant="slate">
                        Archived
                      </Badge>
                    )}
                  </div>

                  <p className="text-slate text-sm line-clamp-2 mt-2">
                    {service.description || 'No description provided.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-line text-sm">
                  <span className="text-slate font-mono text-xs flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-slate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDuration(service.durationMinutes)}
                  </span>
                  <span className="font-display font-bold text-base text-ink">
                    {formatPhp(service.price)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Categories Section */}
        <div className="pt-8 border-t border-line">
          <SectionHeader
            eyebrow="Taxonomy"
            headline="Service Categories"
            description="Group related services together on your public booking page."
          >
            {isAdmin && (
              <Button onClick={openCreateCategory} variant="secondary" size="sm">
                + New Category
              </Button>
            )}
          </SectionHeader>

          {(!categories || categories.length === 0) ? (
            <p className="text-slate text-sm font-mono">No categories yet. Group your services to improve navigation.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Card key={category.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-display font-semibold text-ink truncate">
                      {category.name}
                    </h4>
                    <p className="text-xs text-slate font-mono mt-0.5">
                      {category.serviceCount} {category.serviceCount === 1 ? 'service' : 'services'}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => openEditCategory(category)}
                        className="text-slate hover:text-ink p-1.5 rounded-md hover:bg-ink/5 transition-colors"
                        aria-label={`Edit ${category.name}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: 'category', id: category.id, name: category.name })}
                        className="text-slate hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                        aria-label={`Delete ${category.name}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Service Modal */}
      <Modal
        isOpen={serviceModal.open}
        onClose={() => setServiceModal({ open: false })}
        title={serviceModal.editing ? 'Edit Service' : 'New Service'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={onServiceSubmit} className="space-y-4">
          <div>
            <label htmlFor="service-name" className="block text-xs font-mono uppercase tracking-wider text-slate mb-1">
              Service Name *
            </label>
            <input
              id="service-name"
              {...serviceForm.register('name', { required: 'Name is required' })}
              className="w-full px-4 py-2.5 border border-line rounded-lg bg-paper-white text-ink focus:outline-none focus:ring-2 focus:ring-brass"
              placeholder="e.g. Signature Facial"
            />
            {serviceForm.formState.errors.name && (
              <p className="mt-1 text-xs text-red-600 font-mono" role="alert">
                {serviceForm.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="service-duration" className="block text-xs font-mono uppercase tracking-wider text-slate mb-1">
                Duration (minutes) *
              </label>
              <input
                id="service-duration"
                type="number"
                min={5}
                step={5}
                {...serviceForm.register('durationMinutes', {
                  required: 'Required',
                  min: { value: 5, message: 'Min 5 min' },
                })}
                className="w-full px-4 py-2.5 border border-line rounded-lg bg-paper-white text-ink focus:outline-none focus:ring-2 focus:ring-brass"
              />
              {serviceForm.formState.errors.durationMinutes && (
                <p className="mt-1 text-xs text-red-600 font-mono" role="alert">
                  {serviceForm.formState.errors.durationMinutes.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="service-price" className="block text-xs font-mono uppercase tracking-wider text-slate mb-1">
                Price (â‚± PHP) *
              </label>
              <input
                id="service-price"
                type="number"
                min={0}
                step={0.01}
                {...serviceForm.register('price', {
                  required: 'Required',
                  min: { value: 0, message: 'Min â‚±0' },
                })}
                className="w-full px-4 py-2.5 border border-line rounded-lg bg-paper-white text-ink focus:outline-none focus:ring-2 focus:ring-brass"
              />
              {serviceForm.formState.errors.price && (
                <p className="mt-1 text-xs text-red-600 font-mono" role="alert">
                  {serviceForm.formState.errors.price.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="service-category" className="block text-xs font-mono uppercase tracking-wider text-slate mb-1">
              Category
            </label>
            <select
              id="service-category"
              {...serviceForm.register('categoryId')}
              className="w-full px-4 py-2.5 border border-line rounded-lg bg-paper-white text-ink focus:outline-none focus:ring-2 focus:ring-brass"
            >
              <option value="">No category (Unassigned)</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="service-desc" className="block text-xs font-mono uppercase tracking-wider text-slate mb-1">
              Description
            </label>
            <textarea
              id="service-desc"
              rows={3}
              {...serviceForm.register('description')}
              className="w-full px-4 py-2.5 border border-line rounded-lg bg-paper-white text-ink focus:outline-none focus:ring-2 focus:ring-brass"
              placeholder="Provide a clear description of what this service includes..."
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <input
                id="service-color"
                type="color"
                {...serviceForm.register('color')}
                className="w-8 h-8 rounded border border-line cursor-pointer"
              />
              <label htmlFor="service-color" className="text-xs font-mono uppercase tracking-wider text-slate cursor-pointer">
                Tile Color
              </label>
            </div>

            <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate cursor-pointer">
              <input
                type="checkbox"
                {...serviceForm.register('isActive')}
                className="w-4 h-4 rounded border-line text-brass focus:ring-brass"
              />
              Active for booking
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-line">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setServiceModal({ open: false })}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={createService.isPending || updateService.isPending}
            >
              {createService.isPending || updateService.isPending ? 'Saving...' : 'Save Service'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Category Modal */}
      <Modal
        isOpen={categoryModal.open}
        onClose={() => setCategoryModal({ open: false })}
        title={categoryModal.editing ? 'Edit Category' : 'New Category'}
      >
        <form onSubmit={onCategorySubmit} className="space-y-4">
          <div>
            <label htmlFor="category-name" className="block text-xs font-mono uppercase tracking-wider text-slate mb-1">
              Category Name *
            </label>
            <input
              id="category-name"
              {...categoryForm.register('name', { required: 'Name is required' })}
              className="w-full px-4 py-2.5 border border-line rounded-lg bg-paper-white text-ink focus:outline-none focus:ring-2 focus:ring-brass"
              placeholder="e.g. Hair Care, Aesthetics"
            />
            {categoryForm.formState.errors.name && (
              <p className="mt-1 text-xs text-red-600 font-mono" role="alert">
                {categoryForm.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="category-desc" className="block text-xs font-mono uppercase tracking-wider text-slate mb-1">
              Description
            </label>
            <textarea
              id="category-desc"
              rows={2}
              {...categoryForm.register('description')}
              className="w-full px-4 py-2.5 border border-line rounded-lg bg-paper-white text-ink focus:outline-none focus:ring-2 focus:ring-brass"
            />
          </div>

          <div>
            <label htmlFor="category-order" className="block text-xs font-mono uppercase tracking-wider text-slate mb-1">
              Display Order
            </label>
            <input
              id="category-order"
              type="number"
              {...categoryForm.register('displayOrder')}
              className="w-full px-4 py-2.5 border border-line rounded-lg bg-paper-white text-ink focus:outline-none focus:ring-2 focus:ring-brass"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-line">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setCategoryModal({ open: false })}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={createCategory.isPending || updateCategory.isPending}
            >
              {createCategory.isPending || updateCategory.isPending ? 'Saving...' : 'Save Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.type === 'service' ? 'Service' : 'Category'}`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-slate text-sm">
            Are you sure you want to remove <span className="font-semibold text-ink">"{deleteTarget?.name}"</span>? This action cannot be reversed.
          </p>

          {(deleteService.isError || deleteCategory.isError) && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-mono" role="alert">
              Failed to delete item. Please ensure no active appointments depend on it.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={confirmDelete}
              disabled={deleteService.isPending || deleteCategory.isPending}
            >
              {deleteService.isPending || deleteCategory.isPending ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
