'use client';

import { useState } from 'react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAppStore } from '@/lib/store';
import { 
  Settings, 
  Save, 
  Download, 
  Upload, 
  Trash2, 
  AlertTriangle,
  Database,
  Palette,
  Bell,
  Shield,
  FileText,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function ConfiguracoesPage() {
  const { toast } = useToast();
  const { settings, updateSettings, resetData, exportData, importData } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [formData, setFormData] = useState({
    brandName: settings.brandName,
    logo: settings.logo || '',
    theme: settings.theme,
    primaryColor: settings.primaryColor,
    alertDays: settings.alertDays,
    currency: settings.currency,
    timezone: settings.timezone
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = async () => {
    setIsSubmitting(true);
    try {
      updateSettings(formData);
      toast({
        title: "Configurações salvas!",
        description: "As configurações foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar configurações",
        description: "Ocorreu um erro ao salvar as configurações. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportData = () => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bar-do-carneiro-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Backup exportado!",
        description: "Os dados foram exportados com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar dados",
        description: "Ocorreu um erro ao exportar os dados. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleImportData = async () => {
    if (!importFile) return;

    try {
      const text = await importFile.text();
      importData(text);
      
      toast({
        title: "Dados importados!",
        description: "Os dados foram importados com sucesso. A página será recarregada.",
      });
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      toast({
        title: "Erro ao importar dados",
        description: "Ocorreu um erro ao ler o arquivo. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleResetData = () => {
    if (confirm('ATENÇÃO: Esta ação irá apagar TODOS os dados e restaurar as configurações padrão. Esta ação não pode ser desfeita. Tem certeza?')) {
      resetData();
      toast({
        title: "Dados resetados!",
        description: "Todos os dados foram apagados e as configurações foram restauradas.",
      });
      setTimeout(() => window.location.reload(), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Configure o sistema do BAR DO CARNEIRO
        </p>
      </div>

      <Breadcrumbs />

      {/* Company Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="brandName">Nome da Empresa</Label>
              <Input
                id="brandName"
                value={formData.brandName}
                onChange={(e) => handleInputChange('brandName', e.target.value)}
                placeholder="BAR DO CARNEIRO"
              />
            </div>
            <div>
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                value={formData.logo}
                onChange={(e) => handleInputChange('logo', e.target.value)}
                placeholder="https://exemplo.com/logo.png"
              />
            </div>
            <div>
              <Label htmlFor="currency">Moeda</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => handleInputChange('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">Real Brasileiro (R$)</SelectItem>
                  <SelectItem value="USD">Dólar Americano ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timezone">Fuso Horário</Label>
              <Select 
                value={formData.timezone} 
                onValueChange={(value) => handleInputChange('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                  <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                  <SelectItem value="America/Belem">Belém (GMT-3)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="theme">Tema</Label>
              <Select 
                value={formData.theme} 
                onValueChange={(value) => handleInputChange('theme', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="primaryColor">Cor Primária</Label>
              <Input
                id="primaryColor"
                value={formData.primaryColor}
                onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                placeholder="#FF0000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Configurações de Estoque
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="alertDays">Dias para Alerta de Vencimento</Label>
              <Input
                id="alertDays"
                type="number"
                min="1"
                max="90"
                value={formData.alertDays}
                onChange={(e) => handleInputChange('alertDays', parseInt(e.target.value))}
                placeholder="30"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Quantos dias antes do vencimento mostrar alerta
              </p>
            </div>
            <div>
              <Label htmlFor="lowStockThreshold">Percentual de Estoque Baixo</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                min="1"
                max="100"
                value={20}
                onChange={(e) => {}}
                placeholder="20"
                disabled
              />
              <p className="text-xs text-muted-foreground mt-1">
                Configurável nas configurações avançadas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Aparência e Tema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="theme">Tema Padrão</Label>
              <Select 
                value={formData.theme} 
                onValueChange={(value) => handleInputChange('theme', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="autoBackup">Backup Automático</Label>
              <Select 
                value="false"
                onValueChange={(value) => {}}
                disabled
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Ativado</SelectItem>
                  <SelectItem value="false">Desativado</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Configurável nas configurações avançadas
              </p>
            </div>
            {false && (
              <div>
                <Label htmlFor="backupFrequency">Frequência do Backup</Label>
                <Select 
                  value="weekly"
                  onValueChange={(value) => {}}
                  disabled
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="emailNotifications">Notificações por Email</Label>
              <Select 
                value="false"
                onValueChange={(value) => {}}
                disabled
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Ativado</SelectItem>
                  <SelectItem value="false">Desativado</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Configurável nas configurações avançadas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gerenciamento de Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Button onClick={handleExportData} variant="outline" className="h-20">
              <div className="text-center">
                <Download className="h-6 w-6 mx-auto mb-2" />
                <div>Exportar Dados</div>
                <div className="text-xs text-muted-foreground">Backup completo</div>
              </div>
            </Button>
            
            <div className="space-y-2">
              <Label htmlFor="importFile">Importar Dados</Label>
              <Input
                id="importFile"
                type="file"
                accept=".json"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="h-20"
              />
              {importFile && (
                <Button onClick={handleImportData} className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Importar
                </Button>
              )}
            </div>
            
            <Button 
              onClick={() => setShowResetConfirm(true)} 
              variant="destructive" 
              className="h-20"
            >
              <div className="text-center">
                <Trash2 className="h-6 w-6 mx-auto mb-2" />
                <div>Resetar Dados</div>
                <div className="text-xs text-muted-foreground">Cuidado!</div>
              </div>
            </Button>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              <span>
                <strong>Importante:</strong> Sempre faça um backup antes de importar dados ou resetar o sistema.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Versão do Sistema</Label>
              <p className="text-sm text-muted-foreground">1.0.0</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Última Atualização</Label>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Armazenamento Local</Label>
              <p className="text-sm text-muted-foreground">
                {navigator.storage ? 'Suportado' : 'Não suportado'}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Modo Offline</Label>
              <p className="text-sm text-muted-foreground">
                {navigator.serviceWorker ? 'Suportado' : 'Não suportado'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveSettings} 
          disabled={isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Salvando...
            </div>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Confirmação de Reset
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Esta ação irá apagar TODOS os dados do sistema e restaurar as configurações padrão.
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowResetConfirm(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    setShowResetConfirm(false);
                    handleResetData();
                  }}
                >
                  Confirmar Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
