import React, { useState } from 'react';
import { Wallet, Plus, ArrowRight, Trash2, CheckCircle2, Split, Users, X, Receipt, Edit2, Calendar, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

const EXPENSE_CATEGORIES = [
  'Comida & Tapas',
  'Transporte & Vuelos',
  'Alojamiento',
  'Entradas & Museos',
  'Compras & Recuerdos',
  'Liquidación',
  'Otros'
];

export default function ExpensesView({ 
  expenseData, 
  members, 
  activeMember, 
  currencySymbol = '€', 
  onAddExpense, 
  onUpdateExpense,
  onDeleteExpense 
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'settlement'

  // Form states for general expense
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(activeMember?.id || (members[0]?.id || 1));
  const [splitMembers, setSplitMembers] = useState(members.map(m => m.id));
  const [invitedMembers, setInvitedMembers] = useState([]);
  const [category, setCategory] = useState('Comida & Tapas');
  const [dateStr, setDateStr] = useState(new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);

  // Modal for Abono / Partial Payment
  const [showAbonoModal, setShowAbonoModal] = useState(false);
  const [abonoFrom, setAbonoFrom] = useState(null);
  const [abonoTo, setAbonoTo] = useState(null);
  const [abonoAmount, setAbonoAmount] = useState('');
  const [abonoNote, setAbonoNote] = useState('');
  const [abonoDate, setAbonoDate] = useState(new Date().toISOString().slice(0, 10));

  const expenses = expenseData?.expenses || [];
  const settlements = expenseData?.settlements || [];
  const balances = expenseData?.balances || [];

  const totalTripSpent = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const myBalance = balances.find(b => b.id === activeMember?.id)?.net_balance || 0;

  // Open modal in Add mode
  const handleOpenAddModal = () => {
    setEditingExpenseId(null);
    setTitle('');
    setAmount('');
    setPaidBy(activeMember?.id || (members[0]?.id || 1));
    setSplitMembers(members.map(m => m.id));
    setInvitedMembers([]);
    setCategory('Comida & Tapas');
    setDateStr(new Date().toISOString().slice(0, 10));
    setShowModal(true);
  };

  // Open modal in Edit mode
  const handleOpenEditModal = (expense) => {
    setEditingExpenseId(expense.id);
    setTitle(expense.title || '');
    setAmount(expense.amount ? String(expense.amount) : '');
    setPaidBy(expense.paid_by || (activeMember?.id || 1));
    setSplitMembers(expense.split_members?.length ? expense.split_members : members.map(m => m.id));
    setInvitedMembers(expense.invited_members?.length ? expense.invited_members : []);
    setCategory(expense.category || 'Comida & Tapas');
    setDateStr(expense.date_str || new Date().toISOString().slice(0, 10));
    setShowModal(true);
  };

  // Toggle member in split list
  const toggleSplitMember = (id) => {
    if (splitMembers.includes(id)) {
      if (splitMembers.length > 1) {
        setSplitMembers(splitMembers.filter(mId => mId !== id));
        // Remove from invited if excluded from split
        setInvitedMembers(invitedMembers.filter(mId => mId !== id));
      }
    } else {
      setSplitMembers([...splitMembers, id]);
    }
  };

  const toggleInvitedMember = (id) => {
    if (invitedMembers.includes(id)) {
      setInvitedMembers(invitedMembers.filter(mId => mId !== id));
    } else {
      setInvitedMembers([...invitedMembers, id]);
    }
  };

  const isAllSelected = splitMembers.length === members.length;

  const handleToggleAllSplit = () => {
    if (isAllSelected) {
      // Keep only active member or first member
      setSplitMembers([activeMember?.id || members[0]?.id || 1]);
      setInvitedMembers([]);
    } else {
      setSplitMembers(members.map(m => m.id));
    }
  };

  // Compute live preview per person with invitation support
  const parsedAmount = parseFloat(amount) || 0;
  const baseShare = splitMembers.length > 0 ? (parsedAmount / splitMembers.length) : 0;
  const activeInvitedCount = invitedMembers.filter(id => splitMembers.includes(id) && id !== Number(paidBy)).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) return;
    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        amount: parseFloat(amount),
        paid_by: Number(paidBy),
        split_members: splitMembers,
        invited_members: invitedMembers.filter(id => splitMembers.includes(id) && id !== Number(paidBy)),
        category,
        date_str: dateStr
      };

      if (editingExpenseId && onUpdateExpense) {
        await onUpdateExpense(editingExpenseId, payload);
      } else {
        await onAddExpense(payload);
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#ff3b68', '#f59e0b', '#3b82f6']
        });
      }
      setShowModal(false);
    } catch (err) {
      alert('Error al guardar el gasto');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Settle Full Debt
  const handleSettleFull = async (s) => {
    if (!confirm(`¿Confirmar liquidación total de €${s.amount.toFixed(2)} de ${s.from_name} a ${s.to_name}?`)) return;
    try {
      await onAddExpense({
        title: `Liquidación total a ${s.to_name}`,
        amount: s.amount,
        paid_by: s.from_id,
        split_members: [s.to_id],
        invited_members: [],
        category: 'Liquidación',
        date_str: new Date().toISOString().slice(0, 10)
      });
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#ff3b68']
      });
    } catch (err) {
      alert('Error al registrar la liquidación');
    }
  };

  // Open Abono Modal
  const handleOpenAbono = (s) => {
    setAbonoFrom(s.from_id);
    setAbonoTo(s.to_id);
    setAbonoAmount(String(s.amount));
    setAbonoNote('');
    setAbonoDate(new Date().toISOString().slice(0, 10));
    setShowAbonoModal(true);
  };

  const handleOpenCustomAbono = () => {
    setAbonoFrom(members[0]?.id || 1);
    setAbonoTo(members[1]?.id || members[0]?.id || 1);
    setAbonoAmount('');
    setAbonoNote('');
    setAbonoDate(new Date().toISOString().slice(0, 10));
    setShowAbonoModal(true);
  };

  const handleSubmitAbono = async (e) => {
    e.preventDefault();
    const parsedAbono = parseFloat(abonoAmount);
    if (!parsedAbono || parsedAbono <= 0 || !abonoFrom || !abonoTo) return;
    if (abonoFrom === abonoTo) {
      alert('El pagador y receptor del abono deben ser personas distintas');
      return;
    }

    const fromMember = members.find(m => m.id === abonoFrom);
    const toMember = members.find(m => m.id === abonoTo);

    setSubmitting(true);
    try {
      await onAddExpense({
        title: `Abono de ${fromMember?.name || 'Viajero'} a ${toMember?.name || 'Viajero'}${abonoNote.trim() ? ` (${abonoNote.trim()})` : ''}`,
        amount: parsedAbono,
        paid_by: Number(abonoFrom),
        split_members: [Number(abonoTo)],
        invited_members: [],
        category: 'Liquidación',
        date_str: abonoDate
      });
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#10b981', '#3b82f6', '#ff3b68']
      });
      setShowAbonoModal(false);
    } catch (err) {
      alert('Error al registrar el abono');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-safe pt-1 space-y-3.5 select-none">
      {/* 1. Top Balance Summary Card */}
      <div className="p-4 rounded-3xl bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800/80 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#ff3b68] bg-[#ff3b68]/10 px-2.5 py-0.5 rounded-full border border-[#ff3b68]/20 inline-flex items-center gap-1">
              <Receipt className="w-3 h-3 text-[#ff3b68]" /> Cuentas Claras
            </span>
            <h2 className="text-base font-black text-zinc-900 dark:text-zinc-100 mt-1">
              Gastos del Viaje
            </h2>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="py-2 px-3.5 rounded-2xl bg-[#ff3b68] hover:bg-[#e02854] text-white font-black text-xs shadow-md shadow-[#ff3b68]/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" /> Añadir Gasto
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl p-3 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Total Grupal
            </span>
            <div className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
              €{totalTripSpent.toFixed(2)}
            </div>
            <span className="text-[10px] text-zinc-500 font-medium">{expenses.length} pagos registrados</span>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl p-3 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Tu Balance
            </span>
            <div className={`text-xl font-black mt-0.5 ${
              myBalance > 0.01 
                ? 'text-[#ff3b68]' 
                : myBalance < -0.01 
                  ? 'text-rose-500' 
                  : 'text-zinc-600 dark:text-zinc-400'
            }`}>
              {myBalance > 0.01 ? `+€${myBalance.toFixed(2)}` : `€${myBalance.toFixed(2)}`}
            </div>
            <span className="text-[10px] text-zinc-500 font-medium">
              {myBalance > 0.01 ? 'Te corresponde recibir' : myBalance < -0.01 ? 'Debes transferir' : 'Estás al día'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Sub-Tabs: Historial de Pagos vs Liquidación */}
      <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'list'
              ? 'bg-[#ff3b68] text-white shadow-md font-black'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Historial de Pagos ({expenses.length})
        </button>
        <button
          onClick={() => setActiveTab('settlement')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'settlement'
              ? 'bg-[#ff3b68] text-white shadow-md font-black'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Liquidación de Deudas ({settlements.length})
        </button>
      </div>

      {/* 3. Tab Content */}
      {activeTab === 'list' ? (
        <div className="space-y-2.5">
          {expenses.length > 0 ? (
            expenses.map((expense) => {
              const paidMember = members.find(m => m.id === expense.paid_by);
              const splitList = expense.split_members || [];
              const perPerson = splitList.length > 0 ? (expense.amount / splitList.length).toFixed(2) : expense.amount;

              return (
                <div
                  key={expense.id}
                  className="p-3.5 rounded-3xl bg-white dark:bg-zinc-950/90 border border-zinc-200 dark:border-zinc-800/80 shadow-md flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 truncate">
                        {expense.title}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {expense.category || 'General'}
                      </span>
                    </div>

                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1.5 flex-wrap">
                      <span>Pagado por <strong className="text-zinc-800 dark:text-zinc-200 font-bold">{paidMember?.name || 'Alguien'}</strong></span>
                      <span>•</span>
                      <span>€{perPerson} / pers. ({splitList.length} part.)</span>
                      {expense.invited_members?.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-amber-500 font-bold inline-flex items-center gap-0.5">
                            🎁 Invitó a {expense.invited_members.map(id => members.find(m => m.id === id)?.name).filter(Boolean).join(', ')}
                          </span>
                        </>
                      )}
                      {expense.date_str && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-[#ff3b68] inline-flex items-center gap-0.5">
                            <Calendar className="w-2.5 h-2.5" />
                            {expense.date_str}
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                        €{Number(expense.amount).toFixed(2)}
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenEditModal(expense)}
                      className="p-1.5 rounded-xl text-zinc-400 hover:text-[#ff3b68] hover:bg-[#ff3b68]/10 transition-colors cursor-pointer"
                      title="Editar gasto"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar gasto "${expense.title}"?`)) {
                          onDeleteExpense(expense.id);
                        }
                      }}
                      className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Eliminar gasto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-950/50 border border-dashed border-zinc-300 dark:border-zinc-800/60 text-zinc-500 text-xs">
              Aún no hay gastos registrados. ¡Agrega el primero para llevar las cuentas claras!
            </div>
          )}
        </div>
      ) : (
        /* Settlement Plan */
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
              Deudas Pendientes
            </span>
            <button
              onClick={handleOpenCustomAbono}
              className="px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3 text-[#ff3b68]" /> Registrar Abono Libre
            </button>
          </div>

          {settlements.length > 0 ? (
            <div className="space-y-2.5">
              {settlements.map((s, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-3xl bg-white dark:bg-zinc-950/90 border border-zinc-200 dark:border-zinc-800/80 shadow-md space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 truncate max-w-[100px]">
                        {s.from_name}
                      </span>
                      
                      <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <span>debe a</span>
                        <ArrowRight className="w-3 h-3 text-[#ff3b68]" />
                      </div>

                      <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 truncate max-w-[100px]">
                        {s.to_name}
                      </span>
                    </div>

                    <div className="px-3 py-1.5 rounded-2xl bg-[#ff3b68]/10 border border-[#ff3b68]/20 text-[#ff3b68] text-xs font-black flex-shrink-0">
                      €{s.amount.toFixed(2)}
                    </div>
                  </div>

                  {/* Settlement Action Buttons */}
                  <div className="flex items-center gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-900">
                    <button
                      onClick={() => handleSettleFull(s)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[11px] transition-all flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Saldar Total
                    </button>
                    <button
                      onClick={() => handleOpenAbono(s)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-black text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#ff3b68]" /> Abonar Parte
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              ¡Todas las cuentas están saldadas al día! No hay deudas pendientes entre viajeros. 🎉
            </div>
          )}

          {/* Historial de Liquidaciones y Abonos */}
          {expenses.filter(e => e.category === 'Liquidación').length > 0 && (
            <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2.5 px-1">
                Historial de Liquidaciones y Abonos ({expenses.filter(e => e.category === 'Liquidación').length})
              </h3>
              <div className="space-y-2">
                {expenses.filter(e => e.category === 'Liquidación').map(item => {
                  const fromMember = members.find(m => m.id === item.paid_by);
                  const toMember = members.find(m => m.id === item.split_members?.[0]);
                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs gap-2"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{item.title}</div>
                        <div className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                          <span>{fromMember?.name || 'Viajero'} → {toMember?.name || 'Viajero'}</span>
                          <span>•</span>
                          <span>{item.date_str}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs">
                          €{Number(item.amount).toFixed(2)}
                        </span>
                        <button
                          onClick={() => {
                            if (confirm(`¿Deshacer este abono de €${item.amount}?`)) {
                              onDeleteExpense(item.id);
                            }
                          }}
                          className="p-1 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Deshacer abono"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                {editingExpenseId ? 'Editar Gasto' : 'Registrar Gasto de Viaje'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
              Divide el importe en Euros entre los participantes. Puedes invitar a quien desees sin que deba nada.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Descripción o Concepto
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Cena de tapas, Entradas a museo, Taxi..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs outline-none focus:ring-2 focus:ring-[#ff3b68]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Monto (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs outline-none focus:ring-2 focus:ring-[#ff3b68]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    required
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs outline-none focus:ring-2 focus:ring-[#ff3b68]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    ¿Quién pagó?
                  </label>
                  <select
                    value={paidBy}
                    onChange={(e) => {
                      const newPayer = Number(e.target.value);
                      setPaidBy(newPayer);
                      // Cannot invite oneself
                      setInvitedMembers(invitedMembers.filter(id => id !== newPayer));
                    }}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs outline-none focus:ring-2 focus:ring-[#ff3b68]"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs outline-none focus:ring-2 focus:ring-[#ff3b68]"
                  >
                    {EXPENSE_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Split Members List with Live Preview and Invitations */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Dividir entre ({splitMembers.length}):
                  </label>
                  
                  <button
                    type="button"
                    onClick={handleToggleAllSplit}
                    className={`px-3 py-1 rounded-xl text-[11px] font-black border transition-all cursor-pointer flex items-center gap-1 ${
                      isAllSelected
                        ? 'bg-[#ff3b68] text-white border-[#ff3b68] shadow-sm'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    <span>Todos ({members.length})</span>
                  </button>
                </div>

                {/* Vertical Clean List with Real-time Amount Preview */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {members.map(m => {
                    const isIncluded = splitMembers.includes(m.id);
                    const isPayer = m.id === Number(paidBy);
                    const isInvited = invitedMembers.includes(m.id);

                    // Calculate individual owed share
                    let displayedShare = '0.00';
                    let shareLabel = '';
                    if (!isIncluded) {
                      displayedShare = 'Excluido';
                    } else if (isInvited) {
                      displayedShare = '€0.00';
                      shareLabel = 'Invitado 🎁';
                    } else if (isPayer) {
                      const payerPayerPart = isIncluded ? baseShare : 0;
                      const absorbedPart = activeInvitedCount * baseShare;
                      const totalPayerShare = payerPayerPart + absorbedPart;
                      displayedShare = `€${totalPayerShare.toFixed(2)}`;
                      if (activeInvitedCount > 0) {
                        shareLabel = `Asume +€${absorbedPart.toFixed(2)}`;
                      }
                    } else {
                      displayedShare = `€${baseShare.toFixed(2)}`;
                    }

                    return (
                      <div
                        key={m.id}
                        className={`p-2 rounded-xl text-xs font-bold flex items-center justify-between border transition-all ${
                          isIncluded
                            ? isInvited
                              ? 'border-amber-500/40 bg-amber-500/10 text-zinc-900 dark:text-zinc-100'
                              : 'border-[#ff3b68]/40 bg-[#ff3b68]/10 text-zinc-900 dark:text-zinc-100'
                            : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-zinc-400'
                        }`}
                      >
                        <div
                          onClick={() => toggleSplitMember(m.id)}
                          className="flex items-center gap-2 min-w-0 cursor-pointer flex-1"
                        >
                          <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${isIncluded ? (isInvited ? 'text-amber-500' : 'text-[#ff3b68]') : 'text-zinc-400 dark:text-zinc-600'}`} />
                          <span className="truncate">{m.name}</span>
                          {isPayer && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-[#ff3b68] text-white">
                              Pagador
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Invite Button for non-payer participants */}
                          {isIncluded && !isPayer && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleInvitedMember(m.id);
                              }}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                                isInvited
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-amber-500'
                              }`}
                              title={isInvited ? 'Quitar invitación' : 'Invitar (el pagador asume su parte)'}
                            >
                              {isInvited ? '🎁 Invitado' : 'Invitar'}
                            </button>
                          )}

                          <div className="text-[11px] font-black text-right">
                            {isIncluded ? (
                              <div>
                                <span className={isInvited ? 'text-amber-500' : 'text-[#ff3b68]'}>
                                  {displayedShare}
                                </span>
                                {shareLabel && (
                                  <div className="text-[9px] font-normal text-zinc-400">
                                    {shareLabel}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-zinc-400">Excluido</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {activeInvitedCount > 0 && (
                  <div className="mt-2 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                    🎁 {invitedMembers.filter(id => splitMembers.includes(id) && id !== Number(paidBy)).map(id => members.find(m => m.id === id)?.name).join(', ')} no pagará(n) nada. El pagador asume su parte.
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black bg-[#ff3b68] hover:bg-[#e02854] text-white shadow-md shadow-[#ff3b68]/25 cursor-pointer disabled:opacity-50"
                >
                  {editingExpenseId ? 'Guardar Cambios' : 'Guardar Gasto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Partial Payment / Abono */}
      {showAbonoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-[#ff3b68]" /> Registrar Abono / Pago
              </h3>
              <button
                type="button"
                onClick={() => setShowAbonoModal(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
              Registra una transferencia o pago parcial/total para reducir la deuda entre viajeros.
            </p>

            <form onSubmit={handleSubmitAbono} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    ¿Quién abona/paga?
                  </label>
                  <select
                    value={abonoFrom}
                    onChange={(e) => setAbonoFrom(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs outline-none focus:ring-2 focus:ring-[#ff3b68]"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    ¿Quién recibe?
                  </label>
                  <select
                    value={abonoTo}
                    onChange={(e) => setAbonoTo(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs outline-none focus:ring-2 focus:ring-[#ff3b68]"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Monto del Abono (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={abonoAmount}
                    onChange={(e) => setAbonoAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs outline-none focus:ring-2 focus:ring-[#ff3b68]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    required
                    value={abonoDate}
                    onChange={(e) => setAbonoDate(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs outline-none focus:ring-2 focus:ring-[#ff3b68]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nota / Método (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Transferencia Bizum, Efectivo, etc."
                  value={abonoNote}
                  onChange={(e) => setAbonoNote(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs outline-none focus:ring-2 focus:ring-[#ff3b68]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAbonoModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/25 cursor-pointer disabled:opacity-50"
                >
                  Confirmar Abono
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
