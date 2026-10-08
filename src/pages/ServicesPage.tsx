import React, { useState, useMemo } from 'react';
import { useSalon } from '@/contexts/SalonContext';
import type { SalonService } from '@/types/salon';
import {
  Scissors,
  Plus,
  Search,
  Pin,
  PinOff,
  Edit2,
  Trash2,
  Clock,
  Sparkles,
  Layers,
  FolderPlus,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export const ServicesPage: React.FC = () => {
  const {
    services,
    addService,
    updateService,
    deleteService,
    togglePinService,
    serviceCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    currencyFormat,
    role,
  } = useSalon();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Service Modal
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<SalonService | null>(null);
  const [serviceName, setServiceName] = useState('');
  const [serviceCat, setServiceCat] = useState('');
  const [servicePrice, setServicePrice] = useState('1000');
  const [serviceDuration, setServiceDuration] = useState('30');
  const [serviceDesc, setServiceDesc] = useState('');

  // Category Modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services
      .filter((s) => {
        const q = searchQuery.toLowerCase().trim();
        const matchSearch =
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          (s.description && s.description.toLowerCase().includes(q));

        const matchCat = selectedCategory === 'all' || s.category === selectedCategory;
        return matchSearch && matchCat;
      })
      .sort((a, b) => {
        // Pinned services always appear first!
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return 0;
      });
  }, [services, searchQuery, selectedCategory]);

  const handleOpenAddService = () => {
    setEditingService(null);
    setServiceName('');
    setServiceCat(serviceCategories[0]?.name || 'Hair & Styling');
    setServicePrice('1000');
    setServiceDuration('30');
    setServiceDesc('');
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (s: SalonService) => {
    setEditingService(s);
    setServiceName(s.name);
    setServiceCat(s.category);
    setServicePrice(s.price.toString());
    setServiceDuration((s.duration_minutes || 30).toString());
    setServiceDesc(s.description || '');
    setIsServiceModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) {
      toast.error('Service name is required');
      return;
    }

    const payload = {
      name: serviceName.trim(),
      category: serviceCat,
      price: parseFloat(servicePrice) || 0,
      duration_minutes: parseInt(serviceDuration) || 30,
      description: serviceDesc.trim() || null,
      is_active: true,
      is_pinned: editingService?.is_pinned || false,
    };

    if (editingService) {
      await updateService(editingService.id, payload);
    } else {
      await addService(payload);
    }

    setIsServiceModalOpen(false);
  };

  const handleOpenAddCat = () => {
    setEditingCatId(null);
    setCatName('');
    setCatDesc('');
    setIsCatModalOpen(true);
  };

  const handleOpenEditCat = (cat: { id: string; name: string; description?: string | null }) => {
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatDesc(cat.description || '');
    setIsCatModalOpen(true);
  };

  const handleSaveCat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      toast.error('Category name is required');
      return;
    }

    if (editingCatId) {
      await updateCategory(editingCatId, catName.trim(), catDesc.trim());
    } else {
      await addCategory(catName.trim(), catDesc.trim());
    }

    setIsCatModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Services Catalog & Categories</h1>
            <Badge variant="outline" className="border-primary/40 text-primary">
              PKR Pricing
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage salon services, organize custom categories, and pin core grooming items (Haircut & Beard) to the top for quick POS checkout.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {role === 'owner' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenAddCat}
                className="text-xs h-9 gap-1.5 font-semibold"
              >
                <FolderPlus className="w-4 h-4" />
                Add Category
              </Button>
              <Button onClick={handleOpenAddService} className="text-xs font-semibold gap-1.5 h-9">
                <Plus className="w-4 h-4" />
                Add Service
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Category Management Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" />
            Service Categories ({serviceCategories.length})
          </span>
          <span className="text-muted-foreground">Click category to filter services</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
            className="text-xs h-8"
          >
            All Categories ({services.length})
          </Button>

          {serviceCategories.map((cat) => {
            const count = services.filter((s) => s.category === cat.name).length;
            const isSelected = selectedCategory === cat.name;
            return (
              <div key={cat.id} className="inline-flex items-center">
                <Button
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.name)}
                  className="text-xs h-8 rounded-r-none border-r-0"
                >
                  {cat.name} ({count})
                </Button>
                {role === 'owner' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEditCat(cat)}
                    className="text-xs h-8 px-1.5 rounded-l-none text-muted-foreground hover:text-foreground"
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-card p-3 rounded border">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search service name, category, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-9"
          />
        </div>

        <div className="text-xs text-muted-foreground">
          Showing <span className="font-bold text-foreground">{filteredServices.length}</span> services
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service) => (
          <Card
            key={service.id}
            className={`border shadow-none transition-all ${
              service.is_pinned ? 'border-primary/60 bg-primary/5' : 'hover:border-foreground/30'
            }`}
          >
            <CardHeader className="p-4 pb-2 border-b flex flex-row items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-bold">{service.name}</CardTitle>
                  {service.is_pinned && (
                    <Badge className="bg-primary text-primary-foreground text-[10px] gap-1 font-bold">
                      <Pin className="w-3 h-3 fill-current" />
                      Pinned to Top
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs font-medium flex items-center gap-1.5 mt-0.5">
                  <Badge variant="outline" className="text-[10px]">
                    {service.category}
                  </Badge>
                  <span>•</span>
                  <span>{service.duration_minutes || 30} mins</span>
                </CardDescription>
              </div>

              <div className="flex items-center gap-1">
                {role === 'owner' && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePinService(service.id, !service.is_pinned)}
                      className={`h-7 w-7 ${service.is_pinned ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                      title={service.is_pinned ? 'Unpin Service' : 'Pin to top of POS'}
                    >
                      {service.is_pinned ? <Pin className="w-3.5 h-3.5 fill-current" /> : <PinOff className="w-3.5 h-3.5" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEditService(service)}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteService(service.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-2 text-xs">
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground">Standard Price:</span>
                <span className="text-xl font-bold font-mono text-emerald-600">
                  {currencyFormat(service.price)}
                </span>
              </div>

              {service.description && (
                <p className="text-[11px] text-muted-foreground line-clamp-2">
                  {service.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Service Modal */}
      <Dialog open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveService} className="space-y-3 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Service Name *</Label>
              <Input
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="e.g. Signature Fade & Hot Towel Shave"
                required
                className="h-8 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Category</Label>
                <Select value={serviceCat} onValueChange={setServiceCat}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories.map((c) => (
                      <SelectItem key={c.id} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Price (Rs.) *</Label>
                <Input
                  type="number"
                  value={servicePrice}
                  onChange={(e) => setServicePrice(e.target.value)}
                  placeholder="1000"
                  required
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Estimated Duration (Minutes)</Label>
              <Input
                type="number"
                value={serviceDuration}
                onChange={(e) => setServiceDuration(e.target.value)}
                placeholder="30"
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Textarea
                rows={2}
                value={serviceDesc}
                onChange={(e) => setServiceDesc(e.target.value)}
                placeholder="Details of services, products included..."
                className="text-xs"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsServiceModalOpen(false)} className="text-xs h-8">
                Cancel
              </Button>
              <Button type="submit" className="text-xs h-8 font-bold">
                Save Service
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Category Modal */}
      <Dialog open={isCatModalOpen} onOpenChange={setIsCatModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCatId ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveCat} className="space-y-3 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Category Name *</Label>
              <Input
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="e.g. Beard Grooming & Styling"
                required
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Input
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                placeholder="Short description of this category"
                className="h-8 text-xs"
              />
            </div>

            <DialogFooter className="gap-2">
              {editingCatId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    deleteCategory(editingCatId);
                    setIsCatModalOpen(false);
                  }}
                  className="text-xs h-8 text-destructive"
                >
                  Delete Category
                </Button>
              )}
              <Button type="submit" className="text-xs h-8 font-bold">
                Save Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
