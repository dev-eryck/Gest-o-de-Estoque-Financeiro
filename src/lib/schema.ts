import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  sku: z.string().min(1, 'SKU é obrigatório'),
  ean: z.string().optional(),
  category: z.string().min(1, 'Categoria é obrigatória'),
  supplierId: z.string().min(1, 'Fornecedor é obrigatório'),
  unit: z.enum(['garrafa', 'lata', 'ml', 'un']),
  contentMl: z.number().min(0, 'Conteúdo deve ser maior ou igual a 0'),
  abv: z.number().min(0, 'Teor alcoólico deve ser maior ou igual a 0').max(100, 'Teor alcoólico não pode ser maior que 100%'),
  cost: z.number().min(0, 'Custo deve ser maior ou igual a 0'),
  price: z.number().min(0, 'Preço deve ser maior ou igual a 0'),
  stock: z.number().min(0, 'Estoque deve ser maior ou igual a 0'),
  minStock: z.number().min(0, 'Estoque mínimo deve ser maior ou igual a 0'),
  maxStock: z.number().optional(),
  location: z.string().min(1, 'Localização é obrigatória'),
  expiry: z.string().optional(),
  image: z.string().optional(),
});

export const supplierSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cnpj: z.string().optional(),
  cpf: z.string().optional(),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  address: z.string().optional(),
  paymentTerms: z.string().optional(),
  deliveryTime: z.number().optional(),
});

export const employeeSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().min(1, 'CPF é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().email('E-mail inválido'),
  role: z.enum(['Gerente', 'Barman', 'Garçom', 'Cozinha', 'Caixa']),
  admissionDate: z.string().min(1, 'Data de admissão é obrigatória'),
  observations: z.string().optional(),
  shift: z.enum(['manhã', 'tarde', 'noite']),
  baseSalary: z.number().optional(),
  canAdjustStock: z.boolean(),
  active: z.boolean(),
});

export const stockMoveSchema = z.object({
  productId: z.string().min(1, 'Produto é obrigatório'),
  type: z.enum(['entrada', 'saída']),
  quantity: z.number().min(0.01, 'Quantidade deve ser maior que 0'),
  unitCost: z.number().optional(),
  unitPrice: z.number().optional(),
  reason: z.enum(['compra', 'venda', 'perda', 'consumo_interno', 'ajuste', 'transferencia']),
  notes: z.string().optional(),
  employeeId: z.string().min(1, 'Funcionário é obrigatório'),
  date: z.string().min(1, 'Data é obrigatória'),
});

export const settingsSchema = z.object({
  brandName: z.string().min(1, 'Nome da marca é obrigatório'),
  logo: z.string().optional(),
  theme: z.enum(['light', 'dark']),
  primaryColor: z.string().min(1, 'Cor primária é obrigatória'),
  alertDays: z.number().min(1, 'Dias de alerta deve ser maior que 0'),
  currency: z.string().min(1, 'Moeda é obrigatória'),
  timezone: z.string().min(1, 'Fuso horário é obrigatório'),
});

export type ProductFormData = z.infer<typeof productSchema>;
export type SupplierFormData = z.infer<typeof supplierSchema>;
export type EmployeeFormData = z.infer<typeof employeeSchema>;
export type StockMoveFormData = z.infer<typeof stockMoveSchema>;
export type SettingsFormData = z.infer<typeof settingsSchema>;
