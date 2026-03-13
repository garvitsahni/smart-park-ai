import React, { useRef } from 'react';
import { Printer, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ActiveSession } from '@/lib/parking-data';
// Fallback if qrcode.react is not installed: we will use an image from qrserver
// But ideally, we'd use import { QRCodeSVG } from 'qrcode.react';

interface ContactQRModalProps {
  session: ActiveSession | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ContactQRModal: React.FC<ContactQRModalProps> = ({ session, isOpen, onClose }) => {
  const printRef = useRef<HTMLImageElement>(null);

  if (!session) return null;

  const qrData = window.location.origin + `/contact-owner/${encodeURIComponent(session.vehicleNumber)}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}&color=000000&bgcolor=ffffff`;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Vehicle Contact Pass</title>
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              padding: 40px; 
              text-align: center;
              color: #000;
              background: #fff;
            }
            .card { 
              border: 3px dashed #000; 
              padding: 40px; 
              border-radius: 20px; 
              max-width: 400px; 
              margin: 0 auto; 
            }
            .title { 
              font-size: 28px; 
              font-weight: bold; 
              margin-bottom: 20px; 
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .vehicle { 
              font-size: 36px; 
              font-family: monospace; 
              font-weight: bold; 
              border: 4px solid #000; 
              padding: 15px; 
              border-radius: 12px; 
              margin: 30px 0; 
              display: inline-block;
              letter-spacing: 2px;
            }
            .qr-container { 
              width: 250px; 
              height: 250px; 
              margin: 30px auto; 
            }
            .qr-img { 
              width: 100%; 
              height: 100%; 
              display: block;
            }
            .desc { 
              font-size: 18px; 
              color: #333; 
              margin-top: 30px; 
              line-height: 1.5;
              font-weight: 500;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="title">Contact Owner Pass</div>
            <div class="vehicle">${session.vehicleNumber}</div>
            <div class="qr-container">
              <img src="${qrImageUrl}" alt="Contact QR Code" class="qr-img" />
            </div>
            <div class="desc">Scan this QR code with your phone camera to anonymously contact the owner of this vehicle.</div>
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                // window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-background text-foreground border-border">
        <DialogHeader>
          <DialogTitle>Vehicle Contact Pass</DialogTitle>
          <DialogDescription>
            Generate and print a QR code for your vehicle. Others can scan it to coordinate if you need to move your car.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-6 space-y-8">
          <div className="text-3xl font-mono font-bold tracking-widest border-2 border-primary/20 bg-primary/5 px-6 py-3 rounded-xl gradient-text">
            {session.vehicleNumber}
          </div>
          
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-border">
            <img 
              ref={printRef}
              src={qrImageUrl} 
              alt="QR Code" 
              className="w-48 h-48 object-cover rounded-lg mix-blend-multiply" 
            />
          </div>

          <p className="text-sm text-center text-muted-foreground w-4/5 leading-relaxed">
            Place the printed pass on your dashboard. Your contact details remain private and secure.
          </p>
        </div>

        <DialogFooter className="sm:justify-between flex-row gap-2 mt-2">
          <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handlePrint} className="w-full sm:w-auto gap-2 glow-calm">
            <Printer className="w-4 h-4" />
            Print Pass
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
