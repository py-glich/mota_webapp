import React, { useState } from 'react';
import { 
  Package, Search, Plus, Barcode, Edit3, Archive, 
  Trash2, Upload, Download, AlertTriangle, X, MapPin,
  Image, Camera, PlusCircle, Boxes, CheckCircle2,
  FolderPlus, Eye, Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';
import { BarcodeLabel } from '../components/common/BarcodeLabel';
import { resizeImage, getProductDisplayImage } from '../utils/imageUtils';

export const ProductsPage: React.FC = () => {
  const { 
    products, categories, brands, addProduct, updateProduct, 
    archiveProduct, deleteProduct, recordDamagedStock, bulkImportProducts, 
    suppliers, logAudit, addCategory 
  } = useApp();
  const { hasPermission } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [barcodeModalProduct, setBarcodeModalProduct] = useState<Product | null>(null);
  const [damagedModalProduct, setDamagedModalProduct] = useState<Product | null>(null);
  const [damagedQty, setDamagedQty] = useState<number>(1);
  const [damagedReason, setDamagedReason] = useState<string>('Transit / Unpacking breakage');
  const [showImportModal, setShowImportModal] = useState(false);

  // Category Creation State
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryUrdu, setNewCategoryUrdu] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  // Image Optimization & Lightbox Preview State
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [isResizingImage, setIsResizingImage] = useState(false);

  // Quick Restock / Stock Management State
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState<number>(10);
  const [restockReason, setRestockReason] = useState<string>('Supplier Delivery / Purchase');
  const [restockSupplierId, setRestockSupplierId] = useState<string>('');
  const [restockCost, setRestockCost] = useState<number>(0);
  const [restockNotes, setRestockNotes] = useState<string>('');

  // Shared dark theme class strings
  const inputCls = 'w-full p-2 border rounded-xl bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500';
  const filterCls = 'px-3 py-2 text-xs border border-slate-700 rounded-xl bg-slate-800 text-slate-100 focus:ring-brand-500 focus:outline-hidden';
  const priceInputCls = 'w-full p-1.5 border border-slate-700 rounded-lg bg-slate-900 text-slate-100 font-bold focus:outline-hidden focus:ring-1 focus:ring-brand-500';

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    urduName: '',
    sku: '',
    barcode: '',
    categoryId: 'CAT-ENG',
    brandId: 'BRD-HON',
    compatibleModels: 'Honda CD70, Honda CG125',
    unit: 'Pcs' as Product['unit'],
    purchasePrice: 1000,
    salePrice: 1350,
    wholesalePrice: 1200,
    mechanicPrice: 1250,
    currentStock: 10,
    minStockAlert: 5,
    rack: 'A-01',
    shelf: 'Tier-1',
    bin: 'BIN-01',
    description: '',
    imageUrl: '',
  });

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsResizingImage(true);
      // Auto-resize and compress client-side using Canvas to exact 500x500 square JPEG
      const optimizedDataUrl = await resizeImage(file, { maxWidth: 500, maxHeight: 500, quality: 0.85, square: true });
      setFormData(prev => ({ ...prev, imageUrl: optimizedDataUrl }));
    } catch (err: any) {
      console.warn('Canvas resize fallback to standard FileReader:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
      };
      reader.readAsDataURL(file);
    } finally {
      setIsResizingImage(false);
    }
  };

  const handlePasteImage = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          try {
            setIsResizingImage(true);
            const optimizedDataUrl = await resizeImage(file, { maxWidth: 500, maxHeight: 500, quality: 0.85, square: true });
            setFormData(prev => ({ ...prev, imageUrl: optimizedDataUrl }));
          } catch (err) {
            console.warn('Resize fallback on clipboard paste:', err);
            const reader = new FileReader();
            reader.onload = (event) => {
              setFormData(prev => ({ ...prev, imageUrl: event.target?.result as string }));
            };
            reader.readAsDataURL(file);
          } finally {
            setIsResizingImage(false);
          }
          return;
        }
      }
    }
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      alert('Please enter a category name / برائے مہربانی کیٹیگری کا نام درج کریں');
      return;
    }
    const created = addCategory({
      name: newCategoryName.trim(),
      urduName: newCategoryUrdu.trim() || undefined,
      description: newCategoryDesc.trim() || undefined
    });
    // Auto-select in form if product modal is open
    setFormData(prev => ({ ...prev, categoryId: created.id }));
    setSelectedCategory(created.id);
    setNewCategoryName('');
    setNewCategoryUrdu('');
    setNewCategoryDesc('');
    setShowAddCategoryModal(false);
    alert(`✅ New Category "${created.name}" created successfully!`);
  };

  const openRestockModal = (p: Product) => {
    setRestockProduct(p);
    setRestockQty(10);
    setRestockCost(p.purchasePrice);
    setRestockReason('Supplier Delivery / Purchase');
    setRestockSupplierId(suppliers[0]?.id || '');
    setRestockNotes('');
  };

  const handleConfirmRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProduct) return;
    if (restockQty <= 0) {
      alert('Please enter a quantity greater than 0.');
      return;
    }

    const newStock = restockProduct.currentStock + restockQty;
    const updated: Product = {
      ...restockProduct,
      currentStock: newStock,
      purchasePrice: restockCost > 0 ? restockCost : restockProduct.purchasePrice
    };

    updateProduct(updated);

    const sup = suppliers.find(s => s.id === restockSupplierId);
    logAudit(
      'Inventory',
      'Stock Restocked (+Qty)',
      `Added +${restockQty} ${restockProduct.unit} to "${restockProduct.name}" (SKU: ${restockProduct.sku}). Old: ${restockProduct.currentStock}, New: ${newStock}. Reason: ${restockReason}${sup ? ` | Supplier: ${sup.companyName}` : ''}${restockNotes ? ` | Note: ${restockNotes}` : ''}`
    );

    alert(`✅ Stock updated! +${restockQty} ${restockProduct.unit} added to "${restockProduct.name}". New Stock: ${newStock} ${restockProduct.unit}`);
    setRestockProduct(null);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      urduName: p.urduName || '',
      sku: p.sku,
      barcode: p.barcode,
      categoryId: p.categoryId,
      brandId: p.brandId,
      compatibleModels: p.compatibleModels.join(', '),
      unit: p.unit,
      purchasePrice: p.purchasePrice,
      salePrice: p.salePrice,
      wholesalePrice: p.wholesalePrice,
      mechanicPrice: p.mechanicPrice,
      currentStock: p.currentStock,
      minStockAlert: p.minStockAlert,
      rack: p.location.rack,
      shelf: p.location.shelf,
      bin: p.location.bin || '',
      description: p.description || '',
      imageUrl: p.imageUrl || '',
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      urduName: '',
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      barcode: `896400${Math.floor(10000 + Math.random() * 90000)}`,
      categoryId: 'CAT-ENG',
      brandId: 'BRD-HON',
      compatibleModels: 'Honda CD70, Honda CG125',
      unit: 'Pcs',
      purchasePrice: 1000,
      salePrice: 1350,
      wholesalePrice: 1200,
      mechanicPrice: 1250,
      currentStock: 10,
      minStockAlert: 5,
      rack: 'A-01',
      shelf: 'Tier-1',
      bin: 'BIN-01',
      description: '',
      imageUrl: '',
    });
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim()) {
      alert('Product name and SKU are required.');
      return;
    }

    const payload = {
      name: formData.name,
      urduName: formData.urduName,
      sku: formData.sku,
      barcode: formData.barcode || `896400${Math.floor(10000 + Math.random() * 90000)}`,
      categoryId: formData.categoryId,
      brandId: formData.brandId,
      compatibleModels: formData.compatibleModels.split(',').map(s => s.trim()).filter(Boolean),
      unit: formData.unit,
      purchasePrice: Number(formData.purchasePrice),
      salePrice: Number(formData.salePrice),
      wholesalePrice: Number(formData.wholesalePrice),
      mechanicPrice: Number(formData.mechanicPrice),
      currentStock: Number(formData.currentStock),
      minStockAlert: Number(formData.minStockAlert),
      location: {
        rack: formData.rack,
        shelf: formData.shelf,
        bin: formData.bin,
      },
      description: formData.description,
      imageUrl: formData.imageUrl || undefined,
      isArchived: false,
      damagedStock: 0,
    };

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        ...payload
      });
    } else {
      addProduct(payload);
    }

    setShowAddModal(false);
    resetForm();
  };

  const handleDelete = (p: Product) => {
    if (confirm(`Attempting to delete "${p.name}". The system will verify if it has transaction history...`)) {
      const res = deleteProduct(p.id);
      alert(res.message);
    }
  };

  const handleDamagedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!damagedModalProduct) return;
    if (damagedQty <= 0 || damagedQty > damagedModalProduct.currentStock) {
      alert(`Invalid quantity. Must be between 1 and ${damagedModalProduct.currentStock}.`);
      return;
    }

    recordDamagedStock(damagedModalProduct.id, damagedQty, damagedReason);
    setDamagedModalProduct(null);
    setDamagedQty(1);
    alert(`Damaged stock logged. ${damagedQty} units removed from active inventory.`);
  };

  // Filter Products
  const filteredProducts = products.filter(p => {
    const matchQuery = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery);

    const matchCategory = selectedCategory === 'All' || p.categoryId === selectedCategory;
    const matchBrand = selectedBrand === 'All' || p.brandId === selectedBrand;
    
    let matchStock = true;
    if (stockFilter === 'low') matchStock = p.currentStock <= p.minStockAlert && p.currentStock > 0;
    if (stockFilter === 'out') matchStock = p.currentStock <= 0;

    return matchQuery && matchCategory && matchBrand && matchStock;
  });

  const downloadCsvTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Name,SKU,Barcode,PurchasePrice,SalePrice,StockQty,RackLocation\n" +
      "Atlas Honda Genuine Oil Filter CD70,HON-FLT-70,8964009901,180,250,30,Rack-A1\n" +
      "Crown Lifan Front Brake Shoe Set,CRN-BRK-FR,8964009902,450,650,25,Rack-B2\n" +
      "NGK G-Power Platinum Spark Plug,NGK-PLT-GP,8964009903,650,900,40,Rack-C1\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "motorcycle_parts_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportProductsToCsv = () => {
    let csv = "ID,Name,SKU,Barcode,Category,PurchasePrice,SalePrice,WholesalePrice,Stock,Rack\n";
    products.forEach(p => {
      csv += `"${p.id}","${p.name.replace(/"/g, '""')}","${p.sku}","${p.barcode}","${p.categoryId}",${p.purchasePrice},${p.salePrice},${p.wholesalePrice},${p.currentStock},"${p.location.rack}"\n`;
    });
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `products_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length <= 1) {
        alert('CSV file is empty or only contains headers.');
        return;
      }
      const items: Partial<Product>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        if (!row[0]) continue;
        items.push({
          name: row[0],
          sku: row[1] || `SKU-${Date.now().toString().slice(-4)}-${i}`,
          barcode: row[2] || `896400${Math.floor(10000 + Math.random() * 90000)}`,
          purchasePrice: Number(row[3]) || 500,
          salePrice: Number(row[4]) || 750,
          currentStock: Number(row[5]) || 10,
          location: { rack: row[6] || 'Rack-B', shelf: '1', bin: 'BIN-01' }
        });
      }
      const res = await bulkImportProducts(items);
      alert(`Success: Imported ${res.importedCount} products into database & MongoDB!`);
      setShowImportModal(false);
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="min-h-full bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6 overflow-y-auto pb-28"
      style={{ colorScheme: 'dark' }}
    >
      <div className="w-full space-y-6">
        {/* Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-500" />
              Product & Inventory Catalog
            </h1>
            <p className="text-xs text-slate-400">
              Multi-tier pricing, barcode generator, rack locations, and transaction safeguards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportProductsToCsv}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition border border-slate-700"
              title="Export full catalog to CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setShowImportModal(true)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition border border-slate-700"
            >
              <Upload className="w-3.5 h-3.5 text-brand-500" />
              <span>Excel / CSV Import</span>
            </button>

            <button
              onClick={() => setShowAddCategoryModal(true)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition border border-slate-700"
              title="Create a new motorcycle parts category"
            >
              <FolderPlus className="w-3.5 h-3.5 text-rose-500" />
              <span>+ Add Category</span>
            </button>

            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-500/25 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search name, SKU, or barcode..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-700 rounded-xl bg-slate-800 text-slate-100 placeholder-slate-500 focus:ring-brand-500 focus:outline-hidden"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className={filterCls}
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Brand Filter */}
            <select
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
              className={filterCls}
            >
              <option value="All">All Brands</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            {/* Stock Level Quick Filter */}
            <div className="flex bg-slate-800 p-0.5 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setStockFilter('all')}
                className={`flex-1 py-1.5 rounded-lg transition ${stockFilter === 'all' ? 'bg-slate-950 shadow-xs text-brand-500' : 'text-slate-400 hover:text-slate-200'}`}
              >
                All ({products.length})
              </button>
              <button
                onClick={() => setStockFilter('low')}
                className={`flex-1 py-1.5 rounded-lg transition ${stockFilter === 'low' ? 'bg-slate-950 shadow-xs text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Low Stock
              </button>
              <button
                onClick={() => setStockFilter('out')}
                className={`flex-1 py-1.5 rounded-lg transition ${stockFilter === 'out' ? 'bg-slate-950 shadow-xs text-rose-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Out
              </button>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Product Details</th>
                  <th className="p-3">Category & Brand</th>
                  <th className="p-3">Storage Location</th>
                  <th className="p-3">Current Stock</th>
                  <th className="p-3">Pricing (Rs.)</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredProducts.map(p => {
                  const category = categories.find(c => c.id === p.categoryId);
                  const brand = brands.find(b => b.id === p.brandId);
                  const isOutOfStock = p.currentStock <= 0;
                  const isLowStock = p.currentStock <= p.minStockAlert;

                  return (
                    <tr key={p.id} className={`hover:bg-slate-800/50 transition ${p.isArchived ? 'opacity-50 bg-slate-950' : ''}`}>
                      {/* Name & SKU */}
                      <td className="p-3">
                        <div className="flex items-start gap-2.5">
                          <button
                            type="button"
                            onClick={() => setPreviewImage({ url: getProductDisplayImage(p.imageUrl, p.categoryId, p.name), title: p.name })}
                            className="w-11 h-11 rounded-lg overflow-hidden border border-slate-700 bg-slate-800 shrink-0 shadow-xs hover:border-rose-500 hover:ring-2 hover:ring-rose-500/50 transition cursor-pointer group/thumb relative"
                            title="Click to view full image / بڑی تصویر دیکھیں"
                          >
                            <img
                              src={getProductDisplayImage(p.imageUrl, p.categoryId, p.name)}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover/thumb:scale-110 transition duration-200"
                              onError={(e) => {
                                const el = e.currentTarget;
                                el.onerror = null;
                                el.src = getProductDisplayImage('', p.categoryId, p.name);
                              }}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition">
                              <Eye className="w-3.5 h-3.5 text-white" />
                            </div>
                          </button>
                          <div>
                            <div className="font-bold text-white text-xs">{p.name}</div>
                            {p.urduName && (
                              <div className="urdu-font text-[11px] text-slate-400">{p.urduName}</div>
                            )}
                            <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>SKU: {p.sku}</span>
                              <span>•</span>
                              <span>Barcode: {p.barcode}</span>
                              {p.isArchived && <span className="text-rose-400 font-bold uppercase">(Archived)</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category & Brand */}
                      <td className="p-3">
                        <span className="font-semibold text-slate-200 block">{category?.name || 'Spares'}</span>
                        <span className="text-[10px] text-slate-400">{brand?.name || 'OEM'}</span>
                      </td>

                      {/* Location */}
                      <td className="p-3 font-mono text-[11px]">
                        <div className="flex items-center gap-1 text-slate-300">
                          <MapPin className="w-3 h-3 text-brand-500" />
                          <span>Rack: {p.location.rack}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Shelf: {p.location.shelf} {p.location.bin ? `(${p.location.bin})` : ''}</div>
                      </td>

                      {/* Stock & Quick Add */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            isOutOfStock 
                              ? 'bg-rose-950 text-rose-400 border border-rose-800/40' 
                              : isLowStock 
                                ? 'bg-amber-950 text-amber-400 border border-amber-800/40' 
                                : 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                          }`}>
                            {p.currentStock} {p.unit}
                          </span>
                          <button
                            type="button"
                            onClick={() => openRestockModal(p)}
                            className="px-2 py-0.5 text-[10px] font-bold bg-brand-600/20 hover:bg-brand-600 text-brand-400 hover:text-white rounded-md border border-brand-500/30 transition flex items-center gap-1 shadow-xs"
                            title="Quick Restock / Add Quantity"
                          >
                            <PlusCircle className="w-3 h-3" />
                            + Stock
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">Min Alert: {p.minStockAlert} {p.unit}</div>
                      </td>

                      {/* Pricing */}
                      <td className="p-3 space-y-0.5">
                        <div className="font-extrabold text-white">
                          Retail: Rs. {p.salePrice.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-brand-500 font-medium">
                          Mech: Rs. {p.mechanicPrice.toLocaleString()}
                        </div>
                        {hasPermission('canViewPurchasePrice') && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            Cost: Rs. {p.purchasePrice.toLocaleString()}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => openRestockModal(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition"
                          title="Restock / Add Stock Qty"
                        >
                          <Boxes className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setBarcodeModalProduct(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-slate-800 transition"
                          title="Print Barcode Label Sheet"
                        >
                          <Barcode className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setDamagedModalProduct(p);
                            setDamagedQty(1);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
                          title="Record Damaged / Breakage"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => archiveProduct(p.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-slate-800 transition"
                          title={p.isArchived ? 'Unarchive' : 'Archive Product'}
                        >
                          <Archive className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                          title="Delete (Protected with Safeguard)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" style={{ colorScheme: 'dark' }}>
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-800 flex flex-col max-h-[92vh]">
            <div className="p-4 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between rounded-t-2xl">
              <h3 className="font-bold text-white text-sm">
                {editingProduct ? 'Edit Motorcycle Part' : 'Add New Motorcycle Product'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} onPaste={handlePasteImage} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* Product Photo Upload & Preview Section */}
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/80 flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative group shrink-0">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-brand-500/50 shadow-md bg-slate-900">
                    <img
                      src={getProductDisplayImage(formData.imageUrl, formData.categoryId, formData.name)}
                      alt="Product preview"
                      className="w-full h-full object-cover"
                    />
                    {formData.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: '' })}
                        className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-500 text-white p-1 rounded-full shadow-md transition"
                        title="Remove custom image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isResizingImage && (
                      <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white text-[10px]">
                        <Loader2 className="w-5 h-5 animate-spin text-rose-500 mb-1" />
                        <span>Resizing...</span>
                      </div>
                    )}
                  </div>
                  {!formData.imageUrl && (
                    <span className="text-[9px] text-slate-400 block text-center mt-1 font-mono">Category Default</span>
                  )}
                </div>

                <div className="flex-1 w-full space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-brand-400" />
                      Product Picture / تصویر اپلوڈ کریں
                    </label>
                    {formData.imageUrl ? (
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Resized & Optimized (500x500 Square)
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        Camera photos auto-resized (500x500)
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="cursor-pointer px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-bold text-xs transition flex items-center gap-1.5 shadow-xs">
                      {isResizingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                      <span>Choose File / Camera</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        disabled={isResizingImage}
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                    <span className="text-slate-400 text-[11px]">or paste Image URL:</span>
                  </div>

                  <input
                    type="text"
                    placeholder="Paste image URL (https://...) or data:image/... or press Ctrl+V"
                    value={formData.imageUrl}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value.trim() })}
                    className={inputCls}
                  />
                  <p className="text-[10px] text-slate-400">
                    High-res photos from camera, storage, URL, or clipboard (Ctrl+V) are automatically optimized for instant display.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Product Title (English):</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Honda CG125 Piston Ring Set"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Product Title (Urdu / اردو):</label>
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="ہونڈا 125 پسٹن رنگ"
                    value={formData.urduName}
                    onChange={e => setFormData({ ...formData, urduName: e.target.value })}
                    className={`${inputCls} urdu-font text-sm`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">SKU Code:</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    className={`${inputCls} font-mono`}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Barcode:</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                    className={`${inputCls} font-mono`}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-300">Category:</label>
                    <button
                      type="button"
                      onClick={() => setShowAddCategoryModal(true)}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-0.5 hover:underline cursor-pointer"
                      title="Add a new category on the fly"
                    >
                      <PlusCircle className="w-3 h-3" /> + New
                    </button>
                  </div>
                  <select
                    value={formData.categoryId}
                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                    className={inputCls}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Brand:</label>
                  <select
                    value={formData.brandId}
                    onChange={e => setFormData({ ...formData, brandId: e.target.value })}
                    className={inputCls}
                  >
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing Tiers */}
              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 space-y-2">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
                  Configurable Multi-Tier Pricing (PKR)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] block text-slate-400">Purchase Cost:</label>
                    <input
                      type="number"
                      required
                      value={formData.purchasePrice}
                      onChange={e => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                      className={priceInputCls}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] block text-slate-400">Retail Sale Price:</label>
                    <input
                      type="number"
                      required
                      value={formData.salePrice}
                      onChange={e => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
                      className={`${priceInputCls} !text-brand-500`}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] block text-slate-400">Mechanic Special:</label>
                    <input
                      type="number"
                      value={formData.mechanicPrice}
                      onChange={e => setFormData({ ...formData, mechanicPrice: parseFloat(e.target.value) || 0 })}
                      className={priceInputCls}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] block text-slate-400">Wholesale Price:</label>
                    <input
                      type="number"
                      value={formData.wholesalePrice}
                      onChange={e => setFormData({ ...formData, wholesalePrice: parseFloat(e.target.value) || 0 })}
                      className={priceInputCls}
                    />
                  </div>
                </div>
              </div>

              {/* Stock & Storage Location */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Opening Stock:</label>
                  <input
                    type="number"
                    value={formData.currentStock}
                    onChange={e => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Low Stock Alert Qty:</label>
                  <input
                    type="number"
                    value={formData.minStockAlert}
                    onChange={e => setFormData({ ...formData, minStockAlert: parseInt(e.target.value) || 0 })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Unit of Measure:</label>
                  <select
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value as any })}
                    className={inputCls}
                  >
                    <option value="Pcs">Pcs</option>
                    <option value="Set">Set</option>
                    <option value="Liter">Liter</option>
                    <option value="Box">Box</option>
                    <option value="Pair">Pair</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Rack & Shelf Location:</label>
                  <input
                    type="text"
                    placeholder="Rack A-01 / Shelf 2"
                    value={formData.rack}
                    onChange={e => setFormData({ ...formData, rack: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition shadow-md shadow-brand-500/25"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD DAMAGED STOCK MODAL */}
      {damagedModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4" style={{ colorScheme: 'dark' }}>
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl max-w-md w-full border border-slate-800 p-5 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-white text-sm">
                Record Damaged / Defective Stock
              </h3>
            </div>
            <p className="text-slate-400">
              Product: <strong className="text-slate-100">{damagedModalProduct.name}</strong> (Available: {damagedModalProduct.currentStock} {damagedModalProduct.unit})
            </p>
            <form onSubmit={handleDamagedSubmit} className="space-y-3">
              <div>
                <label className="font-semibold block mb-1 text-slate-300">Damaged Quantity:</label>
                <input
                  type="number"
                  min="1"
                  max={damagedModalProduct.currentStock}
                  value={damagedQty}
                  onChange={e => setDamagedQty(parseInt(e.target.value) || 1)}
                  className={`${inputCls} font-bold`}
                />
              </div>
              <div>
                <label className="font-semibold block mb-1 text-slate-300">Damage Reason / Notes:</label>
                <input
                  type="text"
                  value={damagedReason}
                  onChange={e => setDamagedReason(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDamagedModalProduct(null)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition"
                >
                  Confirm & Write-off
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK RESTOCK / ADD QUANTITY MODAL */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" style={{ colorScheme: 'dark' }}>
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-800 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400">
                <Boxes className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">
                  Quick Stock Management / Add Quantity (اسٹاک کا اضافہ)
                </h3>
              </div>
              <button onClick={() => setRestockProduct(null)} className="p-1 rounded text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Summary Header */}
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/80 flex items-center gap-3">
              <img
                src={getProductDisplayImage(restockProduct.imageUrl, restockProduct.categoryId)}
                alt={restockProduct.name}
                className="w-14 h-14 rounded-lg object-cover border border-slate-700 bg-slate-900 shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getProductDisplayImage('', restockProduct.categoryId);
                }}
              />
              <div className="flex-1">
                <h4 className="font-bold text-white text-sm leading-tight">{restockProduct.name}</h4>
                {restockProduct.urduName && (
                  <p className="urdu-font text-xs text-slate-400 mt-0.5">{restockProduct.urduName}</p>
                )}
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                  <span>SKU: {restockProduct.sku}</span>
                  <span>•</span>
                  <span>Rack: {restockProduct.location.rack}</span>
                </div>
              </div>
            </div>

            {/* Stock Transformation Counter Card */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Stock</span>
                <span className="text-base font-extrabold text-slate-300">
                  {restockProduct.currentStock} <span className="text-xs font-normal">{restockProduct.unit}</span>
                </span>
              </div>
              <div className="border-x border-slate-800 flex flex-col justify-center items-center">
                <span className="text-[10px] text-emerald-400 uppercase font-bold block">+ Adding Qty</span>
                <span className="text-base font-extrabold text-emerald-400">
                  +{restockQty} <span className="text-xs font-normal">{restockProduct.unit}</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] text-brand-400 uppercase font-bold block">New Total Stock</span>
                <span className="text-base font-extrabold text-brand-400">
                  {restockProduct.currentStock + restockQty} <span className="text-xs font-normal">{restockProduct.unit}</span>
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmRestock} className="space-y-3">
              {/* Quantity Input & Quick Increments */}
              <div>
                <label className="font-semibold block mb-1 text-slate-200">
                  Enter Quantity to Add (+ تعداد شامل کریں):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    required
                    value={restockQty}
                    onChange={e => setRestockQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className={`${inputCls} text-base font-bold text-emerald-400`}
                  />
                  <span className="text-slate-400 font-bold text-xs">{restockProduct.unit}</span>
                </div>

                {/* Quick Add Buttons */}
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 font-semibold mr-1">Quick Add:</span>
                  {[5, 10, 20, 50, 100].map(inc => (
                    <button
                      type="button"
                      key={inc}
                      onClick={() => setRestockQty(prev => prev + inc)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] rounded-lg border border-slate-700 transition active:scale-95"
                    >
                      +{inc}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setRestockQty(1)}
                    className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900/60 text-rose-400 font-bold text-[10px] rounded-lg border border-rose-800/40 transition ml-auto"
                  >
                    Reset (1)
                  </button>
                </div>
              </div>

              {/* Purchase Cost & Reason */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Unit Cost / Purchase Price (Rs.):</label>
                  <input
                    type="number"
                    min="0"
                    value={restockCost}
                    onChange={e => setRestockCost(parseFloat(e.target.value) || 0)}
                    className={inputCls}
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Updates default purchase cost</span>
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Restock Reason (وجہ):</label>
                  <select
                    value={restockReason}
                    onChange={e => setRestockReason(e.target.value)}
                    className={inputCls}
                  >
                    <option value="Supplier Purchase / Restock">Supplier Purchase / Restock</option>
                    <option value="Physical Audit Adjustment">Physical Audit Adjustment</option>
                    <option value="Customer Return Restock">Customer Return Restock</option>
                    <option value="Warranty / Replacement Stock">Warranty / Replacement Stock</option>
                    <option value="Opening Stock Balancing">Opening Stock Balancing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Supplier Selection */}
              <div>
                <label className="font-semibold block mb-1 text-slate-300">Supplier / Vendor (Optional):</label>
                <select
                  value={restockSupplierId}
                  onChange={e => setRestockSupplierId(e.target.value)}
                  className={inputCls}
                >
                  <option value="">-- No Supplier Specified --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.companyName} ({s.contactPerson} - {s.phone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="font-semibold block mb-1 text-slate-300">Notes / Invoice Reference:</label>
                <input
                  type="text"
                  placeholder="e.g. Bill # 4018 from Crown Traders"
                  value={restockNotes}
                  onChange={e => setRestockNotes(e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setRestockProduct(null)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Add +{restockQty} {restockProduct.unit}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXCEL / CSV IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4" style={{ colorScheme: 'dark' }}>
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-800 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Upload className="w-4 h-4 text-brand-500" />
                Bulk Product Import (Excel / CSV)
              </h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-400">
              Upload standard motorcycle parts spreadsheet. Required columns: Name, SKU, Barcode, PurchasePrice, SalePrice, StockQty, RackLocation.
            </p>

            <div className="flex items-center justify-between bg-slate-800/60 p-3 rounded-xl border border-slate-700">
              <span className="text-slate-300 font-medium">Download standard sample template:</span>
              <button
                type="button"
                onClick={downloadCsvTemplate}
                className="px-3 py-1.5 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg font-bold transition flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Template.csv</span>
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center bg-slate-800/40 space-y-3">
              <Package className="w-8 h-8 mx-auto text-slate-500" />
              <div>
                <label className="cursor-pointer inline-block px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition shadow-md shadow-rose-600/30">
                  <span>Browse & Upload CSV File</span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleCsvFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-[11px] text-slate-400">
                Or import instant sample motorcycle parts:
              </p>
              <button
                type="button"
                onClick={async () => {
                  const sampleBatch = [
                    { name: 'Yamaha YBR125 Genuine Air Filter', sku: 'YAM-AF-125', barcode: '8964009101', purchasePrice: 750, salePrice: 1100, currentStock: 15, location: { rack: 'Y-01', shelf: '2', bin: 'BIN-10' } },
                    { name: 'Crown CG125 Heavy Duty Rear Sprocket 38T', sku: 'CRN-SPK-38T', barcode: '8964009102', purchasePrice: 850, salePrice: 1250, currentStock: 20, location: { rack: 'A-02', shelf: '1', bin: 'BIN-08' } },
                    { name: 'NGK Spark Plug C7HSA (CD70 / China 70cc)', sku: 'NGK-C7HSA-70', barcode: '8964009103', purchasePrice: 280, salePrice: 420, currentStock: 60, location: { rack: 'C-01', shelf: 'Top', bin: 'BIN-01' } },
                    { name: 'Servis 2.50-17 Cruiser Front Tyre CD70', sku: 'SER-TYR-25017', barcode: '8964009104', purchasePrice: 3200, salePrice: 4100, currentStock: 12, location: { rack: 'TYRE-BAY', shelf: 'Floor', bin: 'TYR-01' } },
                  ];
                  const res = await bulkImportProducts(sampleBatch);
                  alert(`Successfully imported ${res.importedCount} motorcycle products into database!`);
                  setShowImportModal(false);
                }}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold rounded-lg text-[11px] transition"
              >
                Import 4 Pre-built Motorcycle Parts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW CATEGORY MODAL */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4" style={{ colorScheme: 'dark' }}>
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl max-w-md w-full border border-slate-800 overflow-hidden">
            <div className="p-4 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-white text-sm">Add New Category / نئی کیٹیگری</h3>
              </div>
              <button 
                onClick={() => setShowAddCategoryModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-slate-300">
                  Category Name (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suspension & Shock Absorbers, Transmission Gear"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  className={inputCls}
                  autoFocus
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">
                  اردو نام / Urdu Category Name
                </label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="مثلاً: جمپ اور سسپنشن، گیئر اور کلچ"
                  value={newCategoryUrdu}
                  onChange={e => setNewCategoryUrdu(e.target.value)}
                  className={`${inputCls} urdu-font text-sm text-right`}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">
                  Description / تفصیل (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Front fork pipes, rear shock assemblies, bush kits..."
                  value={newCategoryDesc}
                  onChange={e => setNewCategoryDesc(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition shadow-md shadow-rose-600/30 flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL-SIZE IMAGE PREVIEW LIGHTBOX */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
          style={{ colorScheme: 'dark' }}
        >
          <div 
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-slate-950">
              <h3 className="font-bold text-white text-sm truncate">{previewImage.title}</h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-slate-950/70 min-h-[280px]">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="w-72 h-72 sm:w-96 sm:h-96 rounded-2xl object-cover border border-slate-800 shadow-2xl bg-slate-900"
              />
            </div>
            <div className="p-3 border-t border-slate-800 flex justify-end bg-slate-900">
              <button
                onClick={() => setPreviewImage(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BARCODE PRINT SHEET MODAL */}
      {barcodeModalProduct && (
        <BarcodeLabel product={barcodeModalProduct} onClose={() => setBarcodeModalProduct(null)} />
      )}
    </div>
  );
};