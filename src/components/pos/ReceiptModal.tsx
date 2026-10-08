import React from 'react';
import type { Invoice } from '@/types/salon';
import { useSalon } from '@/contexts/SalonContext';
import { maskClientPhone } from '@/utils/phoneMask';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, CheckCircle2, Copy, Gift } from 'lucide-react';
import { toast } from 'sonner';

interface ReceiptModalProps {
  invoice: Invoice | null;
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  invoice,
  isOpen,
  open,
  onClose,
  onOpenChange,
}) => {
  const { settings, currencyFormat, role } = useSalon();

  const isModalOpen = open !== undefined ? open : (isOpen || false);

  const handleClose = () => {
    if (onOpenChange) onOpenChange(false);
    if (onClose) onClose();
  };

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = `
=== ${settings.salon_name} ===
Invoice: ${invoice.invoice_number}
Date: ${new Date(invoice.created_at).toLocaleString()}
Client: ${invoice.client_name} (${invoice.client_phone})
--------------------------------
${invoice.items?.map((it) => `${it.service_name} (${it.staff_name}): ${currencyFormat(it.price)}`).join('\n')}
--------------------------------
Subtotal: ${currencyFormat(invoice.subtotal)}
${role === 'owner' && invoice.loyalty_reward_applied ? `Loyalty Reward: -${currencyFormat(invoice.loyalty_reward_discount || 2500)} (${invoice.loyalty_reward_applied})\n` : ''}
Discount: -${currencyFormat(invoice.discount_amount)}
Tax (${invoice.tax_rate}%): ${currencyFormat(invoice.tax_amount)}
Tip: ${currencyFormat(invoice.tip_amount)}
TOTAL: ${currencyFormat(invoice.total_amount)}
Payment: ${invoice.payment_method}
================================
${settings.receipt_footer}
    `.trim();

    navigator.clipboard.writeText(text);
    toast.success('Invoice details copied to clipboard');
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md p-0 overflow-hidden bg-card border-border">
        <DialogHeader className="p-4 border-b border-border bg-muted/20">
          <DialogTitle className="text-sm font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Checkout Complete • Invoice Receipt
            </span>
            <span className="text-xs font-mono font-medium text-muted-foreground">
              #{invoice.invoice_number}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Receipt Body styled as a clean luxury thermal voucher */}
        <div id="printable-receipt" className="p-6 font-mono text-xs space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Header */}
          <div className="text-center space-y-1 border-b border-dashed border-border pb-4">
            <h2 className="text-base font-bold tracking-tight text-foreground uppercase">
              {settings.salon_name}
            </h2>
            <p className="text-[11px] text-muted-foreground">{settings.tagline}</p>
            <p className="text-[11px] text-muted-foreground">{settings.address}</p>
            <p className="text-[11px] text-muted-foreground">{settings.phone}</p>
          </div>

          {/* Invoice Meta */}
          <div className="space-y-1 text-[11px] border-b border-dashed border-border pb-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Invoice No:</span>
              <span className="font-semibold text-foreground">{invoice.invoice_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date & Time:</span>
              <span>{new Date(invoice.created_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Client:</span>
              <span className="font-semibold text-foreground">{invoice.client_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone:</span>
              <span>{role === 'owner' ? invoice.client_phone : maskClientPhone(invoice.client_phone, role)}</span>
            </div>
            {invoice.client_email && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="truncate max-w-[180px]">{invoice.client_email}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method:</span>
              <span className="font-semibold text-foreground">{invoice.payment_method}</span>
            </div>
          </div>

          {/* Services Rendered */}
          <div className="space-y-2 border-b border-dashed border-border pb-3">
            <div className="flex justify-between text-[11px] text-muted-foreground font-semibold pb-1 border-b border-border/50">
              <span>Service & Stylist</span>
              <span>Amount</span>
            </div>
            {invoice.items && invoice.items.length > 0 ? (
              invoice.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-[11px]">
                  <div className="pr-2">
                    <p className="font-medium text-foreground">{item.service_name}</p>
                    <p className="text-[10px] text-muted-foreground">Stylist: {item.staff_name || 'Unassigned'}</p>
                  </div>
                  <span className="font-medium text-foreground shrink-0">{currencyFormat(item.price)}</span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-2">No itemized services</p>
            )}
          </div>

          {/* Financial Breakdown */}
          <div className="space-y-1.5 text-[11px] border-b border-dashed border-border pb-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>{currencyFormat(invoice.subtotal)}</span>
            </div>

            {role === 'owner' && invoice.loyalty_reward_applied && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span className="flex items-center gap-1">
                  <Gift className="w-3 h-3" />
                  Loyalty Free Facial:
                </span>
                <span>-{currencyFormat(2500)}</span>
              </div>
            )}

            {invoice.discount_amount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Discount ({invoice.discount_type === 'percentage' ? `${invoice.discount_value}%` : 'Fixed'}):</span>
                <span>-{currencyFormat(invoice.discount_amount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax ({invoice.tax_rate}%):</span>
              <span>{currencyFormat(invoice.tax_amount)}</span>
            </div>
            {invoice.tip_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stylist Gratuity / Tip:</span>
                <span>{currencyFormat(invoice.tip_amount)}</span>
              </div>
            )}

            {invoice.split_details && invoice.split_details.length > 0 && (
              <div className="pt-1.5 border-t border-dotted border-border space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Split Breakdown:</span>
                {invoice.split_details.map((s, idx) => (
                  <div key={idx} className="flex justify-between text-[10px] text-muted-foreground pl-2">
                    <span>• {s.method}:</span>
                    <span>{currencyFormat(s.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grand Total */}
          <div className="flex justify-between items-center text-sm font-bold border-b border-dashed border-border pb-3">
            <span className="uppercase tracking-wider">Total Paid</span>
            <span className="text-base text-primary font-black">
              {currencyFormat(invoice.total_amount)}
            </span>
          </div>

          {/* Footer Note */}
          <div className="text-center text-[10px] text-muted-foreground space-y-1 pt-2">
            <p className="font-semibold text-foreground">{settings.receipt_footer}</p>
            <p>Computer generated invoice issued at Karachi, Pakistan.</p>
          </div>
        </div>

        {/* Modal Actions */}
        <DialogFooter className="p-4 border-t border-border bg-muted/20 flex flex-row items-center justify-between gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy} className="text-xs gap-1.5">
            <Copy className="w-3.5 h-3.5" />
            Copy Slip
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleClose} className="text-xs">
              Close
            </Button>
            <Button size="sm" onClick={handlePrint} className="text-xs gap-1.5">
              <Printer className="w-3.5 h-3.5" />
              Print Receipt
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
