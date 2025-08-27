import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Product, 
  Supplier, 
  Employee, 
  StockMove, 
  Settings, 
  DashboardStats 
} from './types';
import { 
  initialProducts, 
  initialSuppliers, 
  initialEmployees, 
  initialMoves, 
  initialSettings 
} from './seeds';

interface AppState {
  // Estado
  products: Product[];
  suppliers: Supplier[];
  employees: Employee[];
  moves: StockMove[];
  settings: Settings;
  
  // Ações de produtos
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
  
  // Ações de fornecedores
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  getSupplier: (id: string) => Supplier | undefined;
  
  // Ações de funcionários
  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  getEmployee: (id: string) => Employee | undefined;
  
  // Ações de movimentações
  addMove: (move: Omit<StockMove, 'id' | 'createdAt'>) => void;
  updateProductStock: (productId: string, stockChange: number) => void;
  getMoves: (filters?: Partial<StockMove>) => StockMove[];
  
  // Ações de configurações
  updateSettings: (updates: Partial<Settings>) => void;
  
  // Seletores e cálculos
  getDashboardStats: () => DashboardStats;
  getLowStockProducts: () => Product[];
  getExpiringProducts: () => Product[];
  getTotalCost: () => number;
  getTotalValue: () => number;
  
  // Utilitários
  resetData: () => void;
  exportData: () => string;
  importData: (data: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      products: initialProducts,
      suppliers: initialSuppliers,
      employees: initialEmployees,
      moves: initialMoves,
      settings: initialSettings,
      
      // Ações de produtos
      addProduct: (productData) => {
        const newProduct: Product = {
          ...productData,
          id: `p${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          products: [...state.products, newProduct],
        }));
      },
      
      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id
              ? { ...product, ...updates, updatedAt: new Date().toISOString() }
              : product
          ),
        }));
      },
      
      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
          moves: state.moves.filter((move) => move.productId !== id),
        }));
      },
      
      getProduct: (id) => {
        return get().products.find((product) => product.id === id);
      },
      
      // Ações de fornecedores
      addSupplier: (supplierData) => {
        const newSupplier: Supplier = {
          ...supplierData,
          id: `s${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          suppliers: [...state.suppliers, newSupplier],
        }));
      },
      
      updateSupplier: (id, updates) => {
        set((state) => ({
          suppliers: state.suppliers.map((supplier) =>
            supplier.id === id
              ? { ...supplier, ...updates, updatedAt: new Date().toISOString() }
              : supplier
          ),
        }));
      },
      
      deleteSupplier: (id) => {
        set((state) => ({
          suppliers: state.suppliers.filter((supplier) => supplier.id !== id),
          products: state.products.filter((product) => product.supplierId !== id),
        }));
      },
      
      getSupplier: (id) => {
        return get().suppliers.find((supplier) => supplier.id === id);
      },
      
      // Ações de funcionários
      addEmployee: (employeeData) => {
        const newEmployee: Employee = {
          ...employeeData,
          id: `e${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          employees: [...state.employees, newEmployee],
        }));
      },
      
      updateEmployee: (id, updates) => {
        set((state) => ({
          employees: state.employees.map((employee) =>
            employee.id === id
              ? { ...employee, ...updates, updatedAt: new Date().toISOString() }
              : employee
          ),
        }));
      },
      
      deleteEmployee: (id) => {
        set((state) => ({
          employees: state.employees.filter((employee) => employee.id !== id),
          moves: state.moves.filter((move) => move.employeeId !== id),
        }));
      },
      
      getEmployee: (id) => {
        return get().employees.find((employee) => employee.id === id);
      },
      
      // Ações de movimentações
      addMove: (moveData) => {
        const newMove: StockMove = {
          ...moveData,
          id: `move_${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        
        // Atualizar estoque do produto
        const product = get().getProduct(moveData.productId);
        if (product) {
          const newStock = moveData.type === 'entrada' 
            ? product.stock + moveData.quantity
            : product.stock - moveData.quantity;
          
          get().updateProduct(moveData.productId, { stock: Math.max(0, newStock) });
        }
        
        set((state) => ({
          moves: [...state.moves, newMove],
        }));
      },
      
      updateProductStock: (productId: string, stockChange: number) => {
        const product = get().getProduct(productId);
        if (product) {
          const newStock = Math.max(0, product.stock + stockChange);
          get().updateProduct(productId, { stock: newStock });
        }
      },
      
      getMoves: (filters = {}) => {
        const state = get();
        let filteredMoves = state.moves;
        
        if (filters.productId) {
          filteredMoves = filteredMoves.filter(move => move.productId === filters.productId);
        }
        if (filters.type) {
          filteredMoves = filteredMoves.filter(move => move.type === filters.type);
        }
        if (filters.employeeId) {
          filteredMoves = filteredMoves.filter(move => move.employeeId === filters.employeeId);
        }
        
        return filteredMoves;
      },
      
      // Ações de configurações
      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates, updatedAt: new Date().toISOString() },
        }));
      },
      
      // Seletores e cálculos
      getDashboardStats: () => {
        const state = get();
        const lowStockProducts = state.getLowStockProducts();
        const expiringProducts = state.getExpiringProducts();
        const totalCost = state.getTotalCost();
        const totalValue = state.getTotalValue();
        
        // Top produtos por movimentação
        const productMoves = state.products.map(product => {
          const moves = state.moves.filter(move => move.productId === product.id);
          return { product, moves: moves.length };
        }).sort((a, b) => b.moves - a.moves).slice(0, 10);
        
        return {
          totalProducts: state.products.length,
          lowStockProducts: lowStockProducts.length,
          expiringProducts: expiringProducts.length,
          totalCost,
          totalValue,
          totalMoves: state.moves.length,
          recentMoves: state.moves.slice(-10).reverse(),
          topProducts: productMoves,
        };
      },
      
      getLowStockProducts: () => {
        const state = get();
        return state.products.filter(product => product.stock <= product.minStock);
      },
      
      getExpiringProducts: () => {
        const state = get();
        const alertDays = state.settings.alertDays;
        const alertDate = new Date();
        alertDate.setDate(alertDate.getDate() + alertDays);
        
        return state.products.filter(product => {
          if (!product.expiry) return false;
          const expiryDate = new Date(product.expiry);
          return expiryDate <= alertDate;
        });
      },
      
      getTotalCost: () => {
        const state = get();
        return state.products.reduce((total, product) => total + (product.cost * product.stock), 0);
      },
      
      getTotalValue: () => {
        const state = get();
        return state.products.reduce((total, product) => total + (product.price * product.stock), 0);
      },
      
      // Utilitários
      resetData: () => {
        set({
          products: initialProducts,
          suppliers: initialSuppliers,
          employees: initialEmployees,
          moves: initialMoves,
          settings: initialSettings,
        });
      },
      
      exportData: () => {
        const state = get();
        const data = {
          products: state.products,
          suppliers: state.suppliers,
          employees: state.employees,
          moves: state.moves,
          settings: state.settings,
          exportedAt: new Date().toISOString(),
        };
        return JSON.stringify(data, null, 2);
      },
      
      importData: (dataString) => {
        try {
          const data = JSON.parse(dataString);
          if (data.products && data.suppliers && data.employees && data.moves && data.settings) {
            set({
              products: data.products,
              suppliers: data.suppliers,
              employees: data.employees,
              moves: data.moves,
              settings: data.settings,
            });
            return true;
          }
        } catch (error) {
          console.error('Erro ao importar dados:', error);
        }
        return false;
      },
    }),
    {
      name: 'bar-do-carneiro-storage',
      partialize: (state) => ({
        products: state.products,
        suppliers: state.suppliers,
        employees: state.employees,
        moves: state.moves,
        settings: state.settings,
      }),
    }
  )
);

