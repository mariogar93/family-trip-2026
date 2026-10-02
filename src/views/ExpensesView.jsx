import React, { useState } from 'react';
import { Wallet, Plus, ArrowRight, Trash2, CheckCircle2, Split, Users, X, Receipt, Edit2, Calendar, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

const EXPENSE_CATEGORIES = [
  'Comida & Tapas',
  'Transporte & Vuelos',
  'Alojamiento',
  'Entradas & Museos',
  'Compras & Recuerdos',
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

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(activeMember?.id || (members[0]?.id || 1));
  const [splitMembers, setSplitMembers] = useState(members.map(m => m.id));
  const [category, setCategory] = useState('Comida & Tapas');
  const [dateStr, setDateStr] = useState(new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);

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
    setCategory(expense.category || 'Comida & Tapas');
    setDateStr(expense.date_str || new Date().toISOString().slice(0, 10));
    setShowModal(true);
  };

  // Toggle member in split list
  const toggleSplitMember = (id) => {
    if (splitMembers.includes(id)) {
      if (splitMembers.length > 1) {
        setSplitMembers(splitMembers.filter(mId => mId !== id));
      }
    } else {
      setSplitMembers([...splitMembers, id]);
    }
  };

  const isAllSelected = splitMembers.length === members.length;

  const handleToggleAllSplit = () => {
    if (isAllSelected) {
      // Keep only active member or first member
      setSplitMembers([activeMember?.id || members[0]?.id || 1]);
    } else {
      setSplitMembers(members.map(m => m.id));
    }
  };

  // Compute live preview per person
  const parsedAmount = parseFloat(amount) || 0;
  const perPersonAmount = splitMembers.length > 0 ? (parsedAmount / splitMembers.length).toFixed(2) : '0.00';

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
        /* Settlement Plan (Without ugly user icons) */
        <div className="space-y-2.5">
          {settlements.length > 0 ? (
            settlements.map((s, idx) => (
              <div
                key={idx}
                className="p-4 rounded-3xl bg-white dark:bg-zinc-950/90 border border-zinc-200 dark:border-zinc-800/80 shadow-md flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 truncate max-w-[110px]">
                    {s.from_name}
                  </span>
                  
                  <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <span>transfiere</span>
                    <ArrowRight className="w-3 h-3 text-[#ff3b68]" />
                  </div>

                  <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 truncate max-w-[110px]">
                    {s.to_name}
                  </span>
                </div>

                <div className="px-3 py-1.5 rounded-2xl bg-[#ff3b68]/10 border border-[#ff3b68]/20 text-[#ff3b68] text-xs font-black flex-shrink-0">
                  €{s.amount.toFixed(2)}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 text-[#ff3b68] text-xs font-bold">
              ¡Todas las cuentas están saldadas al día! No hay deudas pendientes entre viajeros. 🎉
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xl">
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
              Divide el importe en Euros entre los participantes seleccionados.
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
                    onChange={(e) => setPaidBy(Number(e.target.value))}
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

              {/* Split Members List with Live Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Dividir entre ({splitMembers.length}):
                  </label>
                  
                  {/* Clearly Clickable "Todos" Button */}
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
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {members.map(m => {
                    const isIncluded = splitMembers.includes(m.id);
                    return (
                      <div
                        key={m.id}
                        onClick={() => toggleSplitMember(m.id)}
                        className={`p-2 rounded-xl text-xs font-bold flex items-center justify-between border transition-all cursor-pointer ${
                          isIncluded
                            ? 'border-[#ff3b68]/40 bg-[#ff3b68]/10 text-zinc-900 dark:text-zinc-100'
                            : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-zinc-400'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${isIncluded ? 'text-[#ff3b68]' : 'text-zinc-400 dark:text-zinc-600'}`} />
                          <span className="truncate">{m.name}</span>
                        </div>

                        <div className="text-[11px] font-black flex-shrink-0">
                          {isIncluded ? (
                            <span className="text-[#ff3b68]">€{perPersonAmount}</span>
                          ) : (
                            <span className="text-zinc-400">Excluido</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
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
    </div>
  );
}
