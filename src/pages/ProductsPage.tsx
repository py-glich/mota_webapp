import React, { useState } from 'react';
import { 
  Package, Search, Plus, Barcode, Edit3, Archive, 
  Trash2, Upload, Download, AlertTriangle, X, MapPin
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';
import { BarcodeLabel } from '../components/common/BarcodeLabel';

export const ProductsPage: React.FC = () => {
  const { products, categories, brands, addProduct, updateProduct, archiveProduct, deleteProduct, recordDamagedStock, bulkImportProducts } = useApp();
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
  });

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
      className="min-h-full bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6 overflow-y-auto"
      style={{ colorScheme: 'dark' }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
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
                        <div className="font-bold text-white">{p.name}</div>
                        {p.urduName && (
                          <div className="urdu-font text-[11px] text-slate-400">{p.urduName}</div>
                        )}
                        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>SKU: {p.sku}</span>
                          <span>•</span>
                          <span>Barcode: {p.barcode}</span>
                          {p.isArchived && <span className="text-rose-400 font-bold uppercase">(Archived)</span>}
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

                      {/* Stock */}
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          isOutOfStock 
                            ? 'bg-rose-950 text-rose-400' 
                            : isLowStock 
                              ? 'bg-amber-950 text-amber-400' 
                              : 'bg-emerald-950 text-emerald-400'
                        }`}>
                          {p.currentStock} {p.unit}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">Min: {p.minStockAlert}</div>
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

            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
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
                  <label className="font-semibold block mb-1 text-slate-300">Category:</label>
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

      {/* BARCODE PRINT SHEET MODAL */}
      {barcodeModalProduct && (
        <BarcodeLabel product={barcodeModalProduct} onClose={() => setBarcodeModalProduct(null)} />
      )}
    </div>
  );
};