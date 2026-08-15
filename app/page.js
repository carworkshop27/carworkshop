"use client";

import LoginScreen from '../components/auth/LoginScreen';
import Dashboard from '../components/dashboard/Dashboard';
import InventoryList from '../components/inventory/InventoryList';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { 
  Wrench, Search, Camera, User, Car, 
  Plus, ShieldAlert, Info, X, FileDown, Loader2,
  DollarSign, ClipboardList, CheckCircle2,
  LayoutList, LayoutGrid, ArrowRight, Activity,
  Package, RefreshCw, PlusCircle, MinusCircle, ShoppingCart, Truck,
  Lock, ShieldCheck, Users, Briefcase, LogOut, KeyRound, UserCheck, UserPlus, Trash2,
  ArrowLeft, Calendar, Phone, Palette, Shield, CreditCard, Layers, FileSpreadsheet, MessageSquare, Copy, Send
} from 'lucide-react';

if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('THREE.Clock')) return;
    originalWarn(...args);
  };
}

const Canvas = dynamic(
  () => import('@react-three/fiber').then((mod) => mod.Canvas),
  { ssr: false }
);

const OrbitControls = dynamic(
  () => import('@react-three/drei').then((mod) => mod.OrbitControls),
  { ssr: false }
);

const DAMAGE_TYPES = {
  'ok': { label: 'Clean', color: '#059669', cost: 0, uiColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200' },
  'scratch': { label: 'Scratch', color: '#eab308', cost: 150, uiColor: 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200' },
  'dent': { label: 'Large Dent', color: '#f97316', cost: 300, uiColor: 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200' },
  'replace': { label: 'Replace', color: '#dc2626', cost: 600, uiColor: 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200' }
};

const getDamageInfo = (status) => DAMAGE_TYPES[status] || DAMAGE_TYPES['ok'];

const DEFAULT_PANELS = [
  { id: 'front-bumper', name: '1. Front Bumper', status: 'ok', assignedTech: '' },
  { id: 'hood', name: '2. Hood / Bonnet', status: 'scratch', assignedTech: 'David Smith (Lead Tech)' },
  { id: 'roof', name: '3. Roof', status: 'ok', assignedTech: '' },
  { id: 'trunk', name: '4. Trunk / Boot', status: 'ok', assignedTech: '' },
  { id: 'rear-bumper', name: '5. Rear Bumper', status: 'dent', assignedTech: 'David Smith (Lead Tech)' },
  { id: 'front-left-fender', name: '6. Front Left Fender', status: 'ok', assignedTech: '' },
  { id: 'front-right-fender', name: '7. Front Right Fender', status: 'ok', assignedTech: '' },
  { id: 'rear-left-fender', name: '8. Rear Left Fender / Quarter', status: 'ok', assignedTech: '' },
  { id: 'rear-right-fender', name: '9. Rear Right Fender / Quarter', status: 'ok', assignedTech: '' },
  { id: 'front-left-door', name: '10. Front Left Door', status: 'replace', assignedTech: 'David Smith (Lead Tech)' },
  { id: 'front-right-door', name: '11. Front Right Door', status: 'ok', assignedTech: '' },
  { id: 'rear-left-door', name: '12. Rear Left Door', status: 'ok', assignedTech: '' },
  { id: 'rear-right-door', name: '13. Rear Right Door', status: 'ok', assignedTech: '' },
  { id: 'left-skirt', name: '14. Left Side Skirt', status: 'ok', assignedTech: '' },
  { id: 'right-skirt', name: '15. Right Side Skirt', status: 'ok', assignedTech: '' },
];

const INITIAL_INVENTORY = [
  { id: 'parts-1', name: 'Brake Pads Set', stock: 12, costPrice: 50, price: 80 },
  { id: 'parts-2', name: 'Motor Oil (5L)', stock: 25, costPrice: 25, price: 45 },
  { id: 'parts-3', name: 'Headlight Assembly', stock: 6, costPrice: 140, price: 220 },
  { id: 'parts-4', name: 'Spark Plugs (Pack of 4)', stock: 18, costPrice: 35, price: 60 },
];

const PAINT_CHEMICALS_INVENTORY = [
  { id: 'pc-1', name: 'Alpine White Acrylic Base', category: 'Paint', qty: '45 L', hex: '#F8F9FA' },
  { id: 'pc-2', name: 'Jet Black Metallic Gloss', category: 'Paint', qty: '30 L', hex: '#1A1A1A' },
  { id: 'pc-3', name: 'Formula Red Polyurethane', category: 'Paint', qty: '22 L', hex: '#DC2626' },
  { id: 'pc-4', name: 'Midnight Blue Pearl', category: 'Paint', qty: '18 L', hex: '#1E3A8A' },
  { id: 'pc-5', name: 'Silverstone Grey Metallic', category: 'Paint', qty: '40 L', hex: '#6B7280' },
  { id: 'pc-6', name: 'Racing Yellow High-Gloss', category: 'Paint', qty: '15 L', hex: '#EAB308' },
  { id: 'pc-7', name: 'Emerald Green Mica', category: 'Paint', qty: '12 L', hex: '#059669' },
  { id: 'pc-8', name: 'Sunset Orange Pearl', category: 'Paint', qty: '14 L', hex: '#F97316' },
  { id: 'pc-9', name: 'Titanium Matte Grey', category: 'Paint', qty: '25 L', hex: '#4B5563' },
  { id: 'pc-10', name: 'Polaris Silver Base', category: 'Paint', qty: '35 L', hex: '#9CA3AF' },
  { id: 'pc-11', name: 'Sapphire Blue Metallic', category: 'Paint', qty: '20 L', hex: '#2563EB' },
  { id: 'pc-12', name: 'Burgundy Wine Red', category: 'Paint', qty: '10 L', hex: '#831843' },
  { id: 'pc-13', name: 'Champagne Gold Metallic', category: 'Paint', qty: '18 L', hex: '#D97706' },
  { id: 'pc-14', name: 'Arctic Frost White', category: 'Paint', qty: '28 L', hex: '#F3F4F6' },
  { id: 'pc-15', name: 'Carbon Flash Black', category: 'Paint', qty: '32 L', hex: '#111827' },
  { id: 'pc-16', name: 'Viper Blue Tri-Coat', category: 'Paint', qty: '16 L', hex: '#3B82F6' },
  { id: 'pc-17', name: 'Magma Orange Metallic', category: 'Paint', qty: '11 L', hex: '#EA580C' },
  { id: 'pc-18', name: 'Bordeaux Red Pearl', category: 'Paint', qty: '13 L', hex: '#9F1239' },
  { id: 'pc-19', name: 'Lunar Rock Grey', category: 'Paint', qty: '24 L', hex: '#9CA3AF' },
  { id: 'pc-20', name: 'Estoril Blue Metallic', category: 'Paint', qty: '19 L', hex: '#1D4ED8' },
  { id: 'pc-21', name: 'Nardo Grey Solid', category: 'Paint', qty: '50 L', hex: '#6B7280' },
  { id: 'pc-22', name: 'Lime Lightning Green', category: 'Paint', qty: '8 L', hex: '#84CC16' },
  { id: 'pc-23', name: 'Copper Bronze Metallic', category: 'Paint', qty: '17 L', hex: '#B45309' },
  { id: 'pc-24', name: 'Plasma Purple Gloss', category: 'Paint', qty: '9 L', hex: '#7C3AED' },
  { id: 'pc-25', name: 'Glacier Blue Metallic', category: 'Paint', qty: '21 L', hex: '#60A5FA' },
  { id: 'pc-26', name: 'Epoxy Primer Surfacer', category: 'Chemical', qty: '60 L', hex: '#D1D5DB' },
  { id: 'pc-27', name: 'High-Build Filler Primer', category: 'Chemical', qty: '45 L', hex: '#9CA3AF' },
  { id: 'pc-28', name: '2K Urethane Clear Coat', category: 'Chemical', qty: '80 L', hex: '#FEF3C7' },
  { id: 'pc-29', name: 'Fast Dry Clear Coat Activator', category: 'Chemical', qty: '35 L', hex: '#FEF9C3' },
  { id: 'pc-30', name: 'Standard Hardener Solution', category: 'Chemical', qty: '50 L', hex: '#FEF08A' },
  { id: 'pc-31', name: 'Acrylic Reducer / Thinner', category: 'Chemical', qty: '100 L', hex: '#E5E7EB' },
  { id: 'pc-32', name: 'Degreaser & Surface Prep', category: 'Chemical', qty: '75 L', hex: '#E0F2FE' },
  { id: 'pc-33', name: 'Silicone Remover Solvent', category: 'Chemical', qty: '40 L', hex: '#BAE6FD' },
  { id: 'pc-34', name: 'Plastic Adhesion Promoter', category: 'Chemical', qty: '25 L', hex: '#FCE7F3' },
  { id: 'pc-35', name: 'Spot Putty Polyester Filler', category: 'Chemical', qty: '30 kg', hex: '#78716C' },
  { id: 'pc-36', name: 'Fiberglass Body Filler', category: 'Chemical', qty: '40 kg', hex: '#57534E' },
  { id: 'pc-37', name: 'Rust Converter Gel', category: 'Chemical', qty: '20 L', hex: '#1E293B' },
  { id: 'pc-38', name: 'Undercoating Rubberized Spray', category: 'Chemical', qty: '55 L', hex: '#0F172A' },
  { id: 'pc-39', name: 'Weld-Through Primer', category: 'Chemical', qty: '18 L', hex: '#334155' },
  { id: 'pc-40', name: 'Masking Liquid Spray', category: 'Chemical', qty: '25 L', hex: '#CCFBF1' },
  { id: 'pc-41', name: 'Blending Solvent Spray', category: 'Chemical', qty: '30 L', hex: '#FDF4FF' },
  { id: 'pc-42', name: 'Professional Gun Cleaner', category: 'Chemical', qty: '65 L', hex: '#F3E8FF' },
  { id: 'pc-43', name: 'Polish Compound Cutting Grade', category: 'Chemical', qty: '40 L', hex: '#FFFBEB' },
  { id: 'pc-44', name: 'Finishing Glaze Polish', category: 'Chemical', qty: '35 L', hex: '#FEF3C7' },
  { id: 'pc-45', name: 'Ceramic Paint Sealant', category: 'Chemical', qty: '20 L', hex: '#E0E7FF' },
  { id: 'pc-46', name: 'Aluminum Filler Paste', category: 'Chemical', qty: '25 kg', hex: '#94A3B8' },
  { id: 'pc-47', name: 'Acid Etch Primer', category: 'Chemical', qty: '28 L', hex: '#64748B' },
  { id: 'pc-48', name: 'Flex Agent for Plastics', category: 'Chemical', qty: '15 L', hex: '#F1F5F9' },
  { id: 'pc-49', name: 'Waterborne Basecoat Blender', category: 'Chemical', qty: '40 L', hex: '#E2E8F0' },
  { id: 'pc-50', name: 'Anti-Static Degreasing Wipe Solution', category: 'Chemical', qty: '50 L', hex: '#EFF6FF' }
];

const INITIAL_USERS = [
  { id: 'u-1', username: 'superuser', pin: '1234', role: 'Super User', name: 'Master Administrator' },
  { id: 'u-2', username: 'manager', pin: '1234', role: 'Manager', name: 'Alex Morgan (Manager)' },
  { id: 'u-3', username: 'mechanic', pin: '1234', role: 'Mechanic', name: 'David Smith (Lead Tech)' },
  { id: 'u-4', username: 'cashier', pin: '1234', role: 'Cashier', name: 'Sarah Connor (Front Desk)' }
];


export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginInput, setLoginInput] = useState({ username: '', pin: '' });

  const [registeredUsers, setRegisteredUsers] = useState(INITIAL_USERS);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', username: '', pin: '', role: 'Mechanic' });

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [panels, setPanels] = useState(DEFAULT_PANELS);
  const [selectedPanelId, setSelectedPanelId] = useState('hood');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('board'); 

  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [detailedJobCard, setDetailedJobCard] = useState(null);

  // SMS / WhatsApp Simulator Modal State
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [smsJobData, setSmsJobData] = useState(null);

  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [partQuantity, setPartQuantity] = useState(1);

  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [purchaseForm, setPurchaseForm] = useState({
    supplierName: '', partId: 'parts-1', quantity: 10, unitCost: 50
  });

  const [formData, setFormData] = useState({
    owner: '', phone: '', model: '', company: 'Toyota', make: 'Camry', year: '2023', color: 'Pearl White', plate: '', issue: '', status: 'Inspection & Body Check', paymentStatus: 'Unpaid'
  });

  const activeJob = jobs.find(j => j.id === selectedJobId);

  const getFormattedDateString = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}_${month}_${year}`;
  };

  const handleExportInventoryExcel = () => {
    const dateStr = getFormattedDateString();
    const worksheetData = PAINT_CHEMICALS_INVENTORY.map((item, index) => ({
      "No.": index + 1,
      "Item ID": item.id,
      "Item Name": item.name,
      "Category": item.category,
      "Quantity / Stock": item.qty,
      "Color Hex": item.hex
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Store Inventory");
    XLSX.writeFile(workbook, `Store_Stock_${dateStr}.xlsx`);
  };

  const handleExportInventoryPDF = () => {
    const dateStr = getFormattedDateString();
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text("AutoFix Pro - Store & Inventory Stock Report", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${dateStr.replace(/_/g, '-')}`, 14, 28);

    const tableRows = PAINT_CHEMICALS_INVENTORY.map((item, idx) => [
      idx + 1,
      item.name,
      item.category,
      item.qty,
      item.hex
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['#', 'Item Name', 'Category', 'Quantity / Stock', 'Hex Code']],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] }
    });

    doc.save(`Store_Stock_${dateStr}.pdf`);
  };

  const handleExportJobCardsExcel = () => {
    const dateStr = getFormattedDateString();
    const worksheetData = jobs.map((job, index) => ({
      "No.": index + 1,
      "Job ID": job.id,
      "Customer Name": job.owner,
      "Mobile": job.phone,
      "Vehicle": `${job.company || ''} ${job.make || ''} ${job.model} (${job.year || ''})`,
      "Plate No.": job.plate,
      "Workshop Status": job.status,
      "Payment Status": job.paymentStatus || 'Unpaid',
      "Date": job.date
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Job Cards");
    XLSX.writeFile(workbook, `Job_Cards_${dateStr}.xlsx`);
  };

  const handleExportJobCardsPDF = () => {
    const dateStr = getFormattedDateString();
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text("AutoFix Pro - All Job Cards Master Report", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${dateStr.replace(/_/g, '-')}`, 14, 28);

    const tableRows = jobs.map((job, idx) => [
      idx + 1,
      job.id,
      job.owner,
      `${job.model} (${job.plate})`,
      job.status,
      job.paymentStatus || 'Unpaid',
      job.date
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['#', 'Job ID', 'Customer', 'Vehicle & Plate', 'Status', 'Payment', 'Date']],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] }
    });

    doc.save(`Job_Cards_${dateStr}.pdf`);
  };

  const handleExportSalesExcel = () => {
    const dateStr = getFormattedDateString();
    const worksheetData = jobs.map((job, index) => {
      const damageCost = (job.panels || []).reduce((sum, p) => sum + getDamageInfo(p.status).cost, 0);
      const partsCost = (job.parts || []).reduce((sum, pt) => sum + pt.price, 0);
      const grandTotal = damageCost + partsCost;

      return {
        "No.": index + 1,
        "Job ID": job.id,
        "Customer": job.owner,
        "Plate": job.plate,
        "Payment Status": job.paymentStatus || 'Unpaid',
        "Invoice Amount ($)": grandTotal,
        "Date": job.date
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales History");
    XLSX.writeFile(workbook, `Sales_Invoice_History_${dateStr}.xlsx`);
  };

  const handleExportSalesPDF = () => {
    const dateStr = getFormattedDateString();
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text("AutoFix Pro - Sales & Invoice History", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${dateStr.replace(/_/g, '-')}`, 14, 28);

    let overallRevenue = 0;
    const tableRows = jobs.map((job, idx) => {
      const damageCost = (job.panels || []).reduce((sum, p) => sum + getDamageInfo(p.status).cost, 0);
      const partsCost = (job.parts || []).reduce((sum, pt) => sum + pt.price, 0);
      const grandTotal = damageCost + partsCost;
      overallRevenue += grandTotal;

      return [
        idx + 1,
        job.id,
        job.owner,
        job.paymentStatus || 'Unpaid',
        `$${grandTotal.toFixed(2)}`,
        job.date
      ];
    });

    tableRows.push([{ content: `Total Accumulated Revenue: $${overallRevenue.toFixed(2)}`, colSpan: 6, styles: { fontStyle: 'bold', halign: 'right' } }]);

    autoTable(doc, {
      startY: 35,
      head: [['#', 'Job ID', 'Customer', 'Payment Status', 'Invoice Amount', 'Date']],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] }
    });

    doc.save(`Sales_Invoice_History_${dateStr}.pdf`);
  };

  useEffect(() => {
    const loadData = () => {
      setIsLoading(true);
      try {
        const savedUsers = localStorage.getItem('autofix_users_db');
        if (savedUsers) setRegisteredUsers(JSON.parse(savedUsers));

        const savedJobs = localStorage.getItem('autofix_offline_db');
        if (savedJobs) {
          const parsedJobs = JSON.parse(savedJobs);
          setJobs(parsedJobs);
          if (parsedJobs.length > 0) {
            setSelectedJobId(parsedJobs[0].id);
            setPanels(parsedJobs[0].panels || DEFAULT_PANELS);
          }
        }
        const savedInventory = localStorage.getItem('autofix_inventory_db');
        if (savedInventory) setInventory(JSON.parse(savedInventory));

        const savedPOs = localStorage.getItem('autofix_purchase_orders_db');
        if (savedPOs) setPurchaseOrders(JSON.parse(savedPOs));
      } catch (err) {
        console.error("Local Storage Error:", err);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const foundUser = registeredUsers.find(
      u => u.username.toLowerCase() === loginInput.username.trim().toLowerCase() && u.pin === loginInput.pin.trim()
    );

    if (foundUser) {
      setCurrentUser(foundUser);
    } else {
      alert("Invalid Username or PIN.");
    }
  };

  const handleLogout = () => setCurrentUser(null);

  const handleCreateUserSubmit = (e) => {
    e.preventDefault();
    if (currentUser?.role !== 'Super User') return alert("Access Restricted: Only the Super User can create new system accounts.");
    if (!newUserForm.name || !newUserForm.username || !newUserForm.pin) return alert("Please fill in all required user fields.");
    if (registeredUsers.some(u => u.username.toLowerCase() === newUserForm.username.trim().toLowerCase())) return alert("Username already exists.");

    const newCreatedUser = {
      id: `usr-${Date.now()}`,
      name: newUserForm.name,
      username: newUserForm.username.trim().toLowerCase(),
      pin: newUserForm.pin.trim(),
      role: newUserForm.role
    };

    const updatedUsers = [...registeredUsers, newCreatedUser];
    setRegisteredUsers(updatedUsers);
    localStorage.setItem('autofix_users_db', JSON.stringify(updatedUsers));
    alert(`Successfully created user: ${newUserForm.name}!`);
    setIsUserModalOpen(false);
    setNewUserForm({ name: '', username: '', pin: '', role: 'Mechanic' });
  };

  const handleDeleteUser = (userId) => {
    if (currentUser?.role !== 'Super User') return;
    if (registeredUsers.length <= 1) return alert("Cannot delete the last remaining user account.");
    const userToDelete = registeredUsers.find(u => u.id === userId);
    if (userToDelete?.username === 'superuser') return alert("Protected Account.");

    if (confirm(`Are you sure you want to delete user ${userToDelete?.name}?`)) {
      const updatedUsers = registeredUsers.filter(u => u.id !== userId);
      setRegisteredUsers(updatedUsers);
      localStorage.setItem('autofix_users_db', JSON.stringify(updatedUsers));
    }
  };

  const handleSelectJob = (job) => {
    setSelectedJobId(job.id);
    setPanels(job.panels || DEFAULT_PANELS);
  };

  const handleOpenFullJobCard = (job) => {
    setDetailedJobCard(job);
    setActiveScreen('full-job-card');
  };

  const handleOpenSmsModal = (job, e) => {
    if (e) e.stopPropagation();
    setSmsJobData(job);
    setIsSmsModalOpen(true);
  };

  const generateSmsText = (job) => {
    if (!job) return '';
    const damageCost = (job.panels || []).reduce((sum, p) => sum + getDamageInfo(p.status).cost, 0);
    const partsCost = (job.parts || []).reduce((sum, pt) => sum + pt.price, 0);
    const grandTotal = damageCost + partsCost;

    let text = `Hello ${job.owner}, here is an update from AutoFix Pro regarding your vehicle (${job.model} - ${job.plate}).\n\n`;
    text += `Current Workshop Status: ${job.status.toUpperCase()}\n`;
    text += `Total Repair Estimate: $${grandTotal.toFixed(2)}\n`;
    text += `Payment Status: ${job.paymentStatus || 'Unpaid'}\n\n`;
    
    if (job.status === 'Ready for Pickup') {
      text += `🚗 Your vehicle is fully ready for pickup! Please visit our workshop at your earliest convenience.\n\n`;
    } else {
      text += `🔧 Our team is actively processing your vehicle repair.\n\n`;
    }
    
    text += `Thank you for choosing AutoFix Pro!`;
    return text;
  };

  const updatePanelDamage = (panelId, damageType) => {
    const updatedPanels = panels.map(p => p.id === panelId ? { ...p, status: damageType } : p);
    setPanels(updatedPanels);
    
    if (selectedJobId) {
      const updatedJobs = jobs.map(j => j.id === selectedJobId ? { ...j, panels: updatedPanels } : j);
      setJobs(updatedJobs);
      localStorage.setItem('autofix_offline_db', JSON.stringify(updatedJobs));
    }
  };

  const updatePanelTechnician = (panelId, techName) => {
    const updatedPanels = panels.map(p => p.id === panelId ? { ...p, assignedTech: techName } : p);
    setPanels(updatedPanels);

    if (selectedJobId) {
      const updatedJobs = jobs.map(j => j.id === selectedJobId ? { ...j, panels: updatedPanels } : j);
      setJobs(updatedJobs);
      localStorage.setItem('autofix_offline_db', JSON.stringify(updatedJobs));
    }
  };

  const updateJobStatus = (jobId, newStatus, e) => {
    if (e) e.stopPropagation(); 
    if (currentUser?.role === 'Cashier') return alert("Cashiers cannot alter workshop repair progress.");

    const updatedJobs = jobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j);
    setJobs(updatedJobs);
    localStorage.setItem('autofix_offline_db', JSON.stringify(updatedJobs));

    if (detailedJobCard && detailedJobCard.id === jobId) {
      setDetailedJobCard({ ...detailedJobCard, status: newStatus });
    }
  };

  const togglePaymentStatus = (jobId, e) => {
    if (e) e.stopPropagation();
    const updatedJobs = jobs.map(j => {
      if (j.id === jobId) {
        const nextStatus = j.paymentStatus === 'Paid' ? 'Unpaid' : j.paymentStatus === 'Pending' ? 'Paid' : 'Pending';
        return { ...j, paymentStatus: nextStatus };
      }
      return j;
    });
    setJobs(updatedJobs);
    localStorage.setItem('autofix_offline_db', JSON.stringify(updatedJobs));

    if (detailedJobCard && detailedJobCard.id === jobId) {
      setDetailedJobCard(updatedJobs.find(j => j.id === jobId));
    }
  };

  const handleAddPartToJob = (e) => {
    e.preventDefault();
    if (!selectedJobId || !selectedPartId) return alert("Please select a vehicle and a spare part.");

    const part = inventory.find(p => p.id === selectedPartId);
    if (!part) return;

    const qty = parseInt(partQuantity) || 1;
    if (part.stock < qty) return alert(`Not enough stock! Only ${part.stock} units available.`);

    const updatedInventory = inventory.map(p => p.id === selectedPartId ? { ...p, stock: p.stock - qty } : p);
    setInventory(updatedInventory);
    localStorage.setItem('autofix_inventory_db', JSON.stringify(updatedInventory));

    const updatedJobs = jobs.map(j => {
      if (j.id === selectedJobId) {
        const currentParts = j.parts || [];
        return { ...j, parts: [...currentParts, { name: part.name, qty, price: part.price * qty }] };
      }
      return j;
    });
    setJobs(updatedJobs);
    localStorage.setItem('autofix_offline_db', JSON.stringify(updatedJobs));

    alert(`Successfully deducted ${qty}x ${part.name} from inventory!`);
    setSelectedPartId('');
    setPartQuantity(1);
  };

  const handlePurchaseOrderSubmit = (e) => {
    e.preventDefault();
    if (currentUser?.role !== 'Manager' && currentUser?.role !== 'Super User') return alert("Restricted to Managers and Super Users.");
    if (!purchaseForm.supplierName) return alert("Please enter a supplier name.");

    const part = inventory.find(p => p.id === purchaseForm.partId);
    if (!part) return;

    const qty = parseInt(purchaseForm.quantity) || 1;
    const cost = parseFloat(purchaseForm.unitCost) || 0;
    const poId = `PO-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPO = {
      id: poId, supplier: purchaseForm.supplierName, partName: part.name,
      quantity: qty, unitCost: cost, totalCost: qty * cost, date: new Date().toLocaleDateString()
    };

    const updatedInventory = inventory.map(p => p.id === purchaseForm.partId ? { ...p, stock: p.stock + qty, costPrice: cost } : p);
    setInventory(updatedInventory);
    localStorage.setItem('autofix_inventory_db', JSON.stringify(updatedInventory));

    const updatedPOs = [newPO, ...purchaseOrders];
    setPurchaseOrders(updatedPOs);
    localStorage.setItem('autofix_purchase_orders_db', JSON.stringify(updatedPOs));

    alert(`Purchase Order ${poId} logged successfully!`);
    setPurchaseForm({ supplierName: '', partId: 'parts-1', quantity: 10, unitCost: 50 });
  };

  const handleIntakeSubmit = (e) => {
    e.preventDefault();
    if (!formData.owner || !formData.plate || !formData.model) return alert('Please fill in required fields.');

    const uniqueId = `JOB-${Math.floor(1000 + Math.random() * 9000)}`;
    const newJob = {
      id: uniqueId, owner: formData.owner, phone: formData.phone || 'N/A', 
      company: formData.company || 'Toyota', make: formData.make || 'Camry', 
      year: formData.year || '2023', color: formData.color || 'White', 
      model: formData.model, plate: formData.plate.toUpperCase(), 
      status: formData.status, paymentStatus: formData.paymentStatus, 
      issue: formData.issue || 'General Service & Inspection', 
      date: new Date().toLocaleDateString(), panels: DEFAULT_PANELS, parts: []
    };

    const updatedJobs = [newJob, ...jobs];
    setJobs(updatedJobs);
    localStorage.setItem('autofix_offline_db', JSON.stringify(updatedJobs));

    setSelectedJobId(uniqueId);
    setPanels(DEFAULT_PANELS);
    setIsModalOpen(false);
    setFormData({ owner: '', phone: '', model: '', company: 'Toyota', make: 'Camry', year: '2023', color: 'Pearl White', plate: '', issue: '', status: 'Inspection & Body Check', paymentStatus: 'Unpaid' });
  };

  const handleResetData = () => {
    if (currentUser?.role !== 'Super User' && currentUser?.role !== 'Manager') return alert("Restricted.");
    if (confirm("Reset all local records, purchase orders, and inventory?")) {
      localStorage.removeItem('autofix_offline_db');
      localStorage.removeItem('autofix_inventory_db');
      localStorage.removeItem('autofix_purchase_orders_db');
      setJobs([]);
      setInventory(INITIAL_INVENTORY);
      setPurchaseOrders([]);
      window.location.reload();
    }
  };

  const handleDownloadPDF = () => {
    if (!activeJob) return alert("Please select a vehicle first.");
    
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235);
    doc.text("AutoFix Pro", 14, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text("Official Sales Invoice & Estimate", 14, 30);
    
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text(`Job ID: ${activeJob.id}`, 14, 45);
    doc.text(`Customer Name: ${activeJob.owner}`, 14, 52);
    doc.text(`Phone: ${activeJob.phone}`, 14, 59);
    
    doc.text(`Vehicle: ${activeJob.company || ''} ${activeJob.make || ''} ${activeJob.model} (${activeJob.year || '2023'})`, 120, 45);
    doc.text(`Plate: ${activeJob.plate} | Color: ${activeJob.color || 'N/A'}`, 120, 52);
    doc.text(`Payment Status: ${activeJob.paymentStatus || 'Unpaid'}`, 120, 59);
    
    const tableData = [];
    const damagedPanels = (activeJob.panels || panels || []).filter(p => p.status !== 'ok');
    damagedPanels.forEach(p => {
      const info = getDamageInfo(p.status);
      const techStr = p.assignedTech ? ` (${p.assignedTech})` : '';
      tableData.push([p.name, `Body Repair - ${info.label}${techStr}`, `$ ${info.cost.toFixed(2)}`]);
    });

    const jobParts = activeJob.parts || [];
    jobParts.forEach(part => {
      tableData.push([part.name, `Spare Part (x${part.qty})`, `$ ${part.price.toFixed(2)}`]);
    });

    const panelCost = damagedPanels.reduce((sum, p) => sum + getDamageInfo(p.status).cost, 0);
    const partsCost = jobParts.reduce((sum, pt) => sum + pt.price, 0);
    const totalCost = panelCost + partsCost;

    tableData.push([{ content: 'Total Invoice Amount', colSpan: 2, styles: { fontStyle: 'bold', halign: 'right' } }, { content: `$ ${totalCost.toFixed(2)}`, styles: { fontStyle: 'bold' } }]);

    autoTable(doc, {
      startY: 75,
      head: [['Item Description', 'Category / Details', 'Amount']],
      body: tableData.length > 0 ? tableData : [['No items added', 'N/A', '$ 0.00']],
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] }
    });
    
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text("Customer Signature: _______________________", 14, 260);
    doc.text("Thank you for choosing AutoFix Pro!", 14, 275);
    doc.save(`${activeJob.id}_Sales_Invoice.pdf`);
  };

  const selectedPanel = (panels || []).find(p => p.id === selectedPanelId);
  const filteredJobs = jobs.filter(job => 
    job.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalVehicles = jobs.length;
  const readyForPickup = jobs.filter(j => j.status === 'Ready for Pickup').length;
  const totalRevenue = jobs.reduce((acc, job) => {
    const jobDamageCost = (job.panels || []).reduce((sum, p) => sum + getDamageInfo(p.status).cost, 0);
    const jobPartsCost = (job.parts || []).reduce((sum, pt) => sum + pt.price, 0);
    return acc + jobDamageCost + jobPartsCost;
  }, 0);

  if (!currentUser) {
  return (
    <LoginScreen
      loginInput={loginInput}
      setLoginInput={setLoginInput}
      onSubmit={handleLoginSubmit}
    />
  );
}

  if (activeScreen === 'full-job-card' && detailedJobCard) {
    const jobPanels = detailedJobCard.panels || DEFAULT_PANELS;
    const damagedPanelsList = jobPanels.filter(p => p.status !== 'ok');
    const jobPartsList = detailedJobCard.parts || [];
    
    const repairCost = damagedPanelsList.reduce((sum, p) => sum + getDamageInfo(p.status).cost, 0);
    const partsCost = jobPartsList.reduce((sum, pt) => sum + pt.price, 0);
    const totalJobCost = repairCost + partsCost;

    const currentPayStatus = detailedJobCard.paymentStatus || 'Unpaid';
    const payStatusColor = currentPayStatus === 'Paid' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : currentPayStatus === 'Pending' ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-rose-100 text-rose-900 border-rose-300';

    const assignedTechsSet = new Set(damagedPanelsList.map(p => p.assignedTech).filter(Boolean));
    const assignedTechsList = Array.from(assignedTechsSet);

    return (
      <div className="min-h-screen bg-slate-100 text-slate-800 pb-12">
        <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 gap-4">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setActiveScreen('dashboard')} 
                  className="bg-slate-800 hover:bg-slate-700 p-2 rounded-lg text-white flex items-center space-x-1 text-xs font-bold border border-slate-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Dashboard</span>
                </button>
                <div>
                  <h1 className="font-bold text-lg leading-tight">Job Card Report: {detailedJobCard.id}</h1>
                  <p className="text-xs text-slate-400">Complete Vehicle & Repair Specifications</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={(e) => handleOpenSmsModal(detailedJobCard, e)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>SMS / WhatsApp</span>
                </button>
                <span className="text-xs font-bold bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-emerald-400">
                  {detailedJobCard.status}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-xl text-blue-700"><CreditCard className="w-6 h-6" /></div>
              <div>
                <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Payment Status Bar</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-black px-3 py-1 rounded-full uppercase border shadow-sm ${payStatusColor}`}>
                    {currentPayStatus}
                  </span>
                  <button 
                    onClick={() => togglePaymentStatus(detailedJobCard.id)}
                    className="text-xs font-bold text-blue-700 hover:underline bg-slate-100 px-3 py-1 rounded-lg border border-slate-300"
                  >
                    Toggle Payment Status
                  </button>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Invoice Cost</p>
              <h3 className="text-3xl font-black text-slate-900">${totalJobCost.toFixed(2)}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-4 border-b border-slate-200 pb-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <h3 className="font-extrabold text-base text-slate-900">Customer Information</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-extrabold text-slate-400 uppercase">Full Name</span>
                    <p className="text-base font-black text-slate-900">{detailedJobCard.owner}</p>
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-slate-400 uppercase">Mobile Number</span>
                    <p className="text-base font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-4 h-4 text-emerald-600" /> {detailedJobCard.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-4 border-b border-slate-200 pb-3">
                  <Car className="w-5 h-5 text-blue-600" />
                  <h3 className="font-extrabold text-base text-slate-900">Vehicle Specifications</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs font-extrabold text-slate-400 uppercase">Company / Make</span>
                    <p className="text-sm font-black text-slate-900">{detailedJobCard.company || 'Toyota'} {detailedJobCard.make || ''}</p>
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-slate-400 uppercase">Model & Year</span>
                    <p className="text-sm font-black text-slate-900">{detailedJobCard.model} ({detailedJobCard.year || '2023'})</p>
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-slate-400 uppercase">Car Color</span>
                    <p className="text-sm font-black text-slate-900 flex items-center gap-1 mt-0.5">
                      <Palette className="w-4 h-4 text-purple-600" /> {detailedJobCard.color || 'Pearl White'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-slate-400 uppercase">Plate Number</span>
                    <p className="text-sm font-mono font-black text-blue-700">{detailedJobCard.plate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-4 border-b border-slate-200 pb-3">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              <h3 className="font-extrabold text-base text-slate-900">Assigned Technician & Labor Team</h3>
            </div>
            {assignedTechsList.length === 0 ? (
              <p className="text-xs font-bold text-slate-500 py-2">No individual technicians assigned to panels yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {assignedTechsList.map((tech, idx) => (
                  <span key={idx} className="bg-indigo-50 text-indigo-900 border border-indigo-200 font-extrabold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-600" /> {tech}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-4 border-b border-slate-200 pb-3">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-base text-slate-900">Repairs & Bodywork Required ({damagedPanelsList.length} Panels)</h3>
            </div>
            {damagedPanelsList.length === 0 ? (
              <p className="text-xs font-bold text-slate-500 py-3">No body damages reported. Clean inspection.</p>
            ) : (
              <div className="space-y-2">
                {damagedPanelsList.map(p => {
                  const info = getDamageInfo(p.status);
                  return (
                    <div key={p.id} className="flex justify-between items-center bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">{p.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase border ${info.uiColor}`}>{info.label}</span>
                          {p.assignedTech && (
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                              Tech: {p.assignedTech}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-black text-slate-900">${info.cost.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-4 border-b border-slate-200 pb-3">
              <Package className="w-5 h-5 text-blue-600" />
              <h3 className="font-extrabold text-base text-slate-900">Required Materials & Spare Parts ({jobPartsList.length})</h3>
            </div>
            {jobPartsList.length === 0 ? (
              <p className="text-xs font-bold text-slate-500 py-3">No spare parts deducted for this job yet.</p>
            ) : (
              <div className="space-y-2">
                {jobPartsList.map((pt, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-blue-50/50 border border-blue-200 p-3 rounded-xl">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{pt.name}</h4>
                      <p className="text-xs font-bold text-blue-700">Quantity Required: x{pt.qty}</p>
                    </div>
                    <span className="font-black text-slate-900">${pt.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (activeScreen === 'inventory-list') {
    return (
      <InventoryList
        inventoryData={PAINT_CHEMICALS_INVENTORY}
        handleExportInventoryExcel={handleExportInventoryExcel}
        handleExportInventoryPDF={handleExportInventoryPDF}
        setActiveScreen={setActiveScreen}
      />
    );
  }
  return (
    <>

    <Dashboard
      currentUser={currentUser}
      activeJob={activeJob}
      filteredJobs={filteredJobs}
      inventory={inventory}
      totalVehicles={totalVehicles}
      totalRevenue={totalRevenue}
      readyForPickup={readyForPickup}
      searchTerm={searchTerm}
      viewMode={viewMode}
      partQuantity={partQuantity}
      selectedPartId={selectedPartId}
      pColor={pColor}
      pStatus={pStatus}
      isLoading={isLoading}
      handleAddPartToJob={handleAddPartToJob}
      handleExportJobCardsExcel={handleExportJobCardsExcel}
      handleExportJobCardsPDF={handleExportJobCardsPDF}
      handleExportSalesExcel={handleExportSalesExcel}
      handleExportSalesPDF={handleExportSalesPDF}
      handleLogout={handleLogout}
      handleOpenFullJobCard={handleOpenFullJobCard}
      handleOpenSmsModal={handleOpenSmsModal}
      isSmsModalOpen={isSmsModalOpen}
      smsJobData={smsJobData}
      generateSmsText={generateSmsText}
      handlePurchaseOrderSubmit={handlePurchaseOrderSubmit}
      handleResetData={handleResetData}
      handleSelectJob={handleSelectJob}
      setActiveScreen={setActiveScreen}
      setIsModalOpen={setIsModalOpen}
      setIsSmsModalOpen={setIsSmsModalOpen}
      setIsUserModalOpen={setIsUserModalOpen}
      setPartQuantity={setPartQuantity}
      setPurchaseForm={setPurchaseForm}
      setSearchTerm={setSearchTerm}
      setSelectedPartId={setSelectedPartId}
      setViewMode={setViewMode}
    />

      {isUserModalOpen && currentUser.role === 'Super User' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-300">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-400" />
                <h3 className="font-extrabold text-lg">Super User: System Account Manager</h3>
              </div>
              <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <form onSubmit={handleCreateUserSubmit} className="bg-purple-50 border border-purple-200 p-4 rounded-xl space-y-3">
                <h4 className="font-extrabold text-xs text-purple-950 uppercase tracking-wider flex items-center gap-1">
                  <UserPlus className="w-4 h-4 text-purple-700" /> Create New Staff Account & Assign Privileges
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-800 mb-1">Full Name *</label>
                    <input type="text" required placeholder="e.g. Robert Downey" value={newUserForm.name} onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })} className="w-full px-3 py-2 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-800 mb-1">Login Username *</label>
                    <input type="text" required placeholder="e.g. robert" value={newUserForm.username} onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })} className="w-full px-3 py-2 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-800 mb-1">Login PIN *</label>
                    <input type="password" required placeholder="e.g. 1234" value={newUserForm.pin} onChange={(e) => setNewUserForm({ ...newUserForm, pin: e.target.value })} className="w-full px-3 py-2 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-800 mb-1">Assign Role / Privilege *</label>
                    <select value={newUserForm.role} onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })} className="w-full px-3 py-2 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-600">
                      <option value="Super User">Super User (Full Control)</option>
                      <option value="Manager">Manager (Purchase Orders & Admin)</option>
                      <option value="Mechanic">Mechanic (3D Inspection & Workshop)</option>
                      <option value="Cashier">Cashier (Intake & Billing)</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs rounded-lg shadow">Create Account</button>
              </form>

              <div>
                <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider mb-2">Existing System Users ({registeredUsers.length})</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100 text-slate-900 uppercase font-black text-[10px]">
                      <tr>
                        <th className="p-3">Name</th>
                        <th className="p-3">Username</th>
                        <th className="p-3">Role / Privileges</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-bold">
                      {registeredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="p-3 text-slate-900">{u.name}</td>
                          <td className="p-3 font-mono text-blue-700">{u.username}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-black ${u.role === 'Super User' ? 'bg-purple-100 text-purple-900 border border-purple-300' : 'bg-slate-200 text-slate-800'}`}>{u.role}</span>
                          </td>
                          <td className="p-3 text-right">
                            {u.username !== 'superuser' && (
                              <button onClick={() => handleDeleteUser(u.id)} className="text-rose-600 hover:text-rose-800 p-1"><Trash2 className="w-4 h-4" /></button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-300">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Car className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-lg">New Vehicle Intake Registration</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleIntakeSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">Customer Name *</label>
                  <input type="text" required placeholder="e.g. John Doe" value={formData.owner} onChange={(e) => setFormData({ ...formData, owner: e.target.value })} className="w-full px-3 py-2 text-sm font-bold text-slate-900 border border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">Mobile Number *</label>
                  <input type="text" required placeholder="e.g. +1 555-0199" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 text-sm font-bold text-slate-900 border border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-800 mb-1">Company</label>
                  <input type="text" placeholder="e.g. Toyota" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="w-full px-2 py-2 text-xs font-bold text-slate-900 border border-slate-400 rounded-lg" />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-800 mb-1">Make / Model</label>
                  <input type="text" required placeholder="e.g. Camry" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} className="w-full px-2 py-2 text-xs font-bold text-slate-900 border border-slate-400 rounded-lg" />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-800 mb-1">Year</label>
                  <input type="text" placeholder="e.g. 2023" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className="w-full px-2 py-2 text-xs font-bold text-slate-900 border border-slate-400 rounded-lg" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">Car Color *</label>
                  <input type="text" required placeholder="e.g. Pearl White" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="w-full px-3 py-2 text-sm font-bold text-slate-900 border border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">Plate Number *</label>
                  <input type="text" required placeholder="e.g. KSA-4092" value={formData.plate} onChange={(e) => setFormData({ ...formData, plate: e.target.value })} className="w-full px-3 py-2 text-sm font-black text-slate-900 border border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">Initial Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 text-sm font-bold text-slate-900 border border-slate-400 rounded-lg bg-white">
                    <option value="Inspection & Body Check">Inspection & Body Check</option>
                    <option value="In Repair / Workshop">In Repair / Workshop</option>
                    <option value="Ready for Pickup">Ready for Pickup</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">Initial Payment</label>
                  <select value={formData.paymentStatus} onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })} className="w-full px-3 py-2 text-sm font-bold text-slate-900 border border-slate-400 rounded-lg bg-white">
                    <option value="Unpaid">Unpaid</option>
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">Reported Issue / Notes</label>
                <textarea rows="2" placeholder="Describe initial complaint..." value={formData.issue} onChange={(e) => setFormData({ ...formData, issue: e.target.value })} className="w-full px-3 py-2 text-sm font-bold text-slate-900 border border-slate-400 rounded-lg"></textarea>
              </div>
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-200 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-extrabold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow">Save Intake Locally</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
