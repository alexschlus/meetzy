
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

type TimePickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onChange: (time: string) => void;
};

export default function TimePickerDialog({ open, onOpenChange, value, onChange }: TimePickerDialogProps) {
  const [selectedHour, setSelectedHour] = useState(() => {
    if (value) {
      return parseInt(value.split(':')[0]) || 12;
    }
    return 12;
  });
  
  const [selectedMinute, setSelectedMinute] = useState(() => {
    if (value) {
      return parseInt(value.split(':')[1]) || 0;
    }
    return 0;
  });

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  const handleConfirm = () => {
    const timeString = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    onChange(timeString);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Select Time
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-4 p-4">
          {/* Hours */}
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block text-center">Hours</label>
            <div className="max-h-48 overflow-y-auto border rounded-md bg-glass">
              {hours.map((hour) => (
                <button
                  key={hour}
                  type="button"
                  onClick={() => setSelectedHour(hour)}
                  className={`w-full px-3 py-2 text-center hover:bg-blue-400/20 transition-colors ${
                    selectedHour === hour 
                      ? 'bg-blue-400/40 text-blue-50 font-semibold' 
                      : 'text-blue-100/80'
                  }`}
                >
                  {hour.toString().padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>

          {/* Minutes */}
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block text-center">Minutes</label>
            <div className="max-h-48 overflow-y-auto border rounded-md bg-glass">
              {minutes.map((minute) => (
                <button
                  key={minute}
                  type="button"
                  onClick={() => setSelectedMinute(minute)}
                  className={`w-full px-3 py-2 text-center hover:bg-blue-400/20 transition-colors ${
                    selectedMinute === minute 
                      ? 'bg-blue-400/40 text-blue-50 font-semibold' 
                      : 'text-blue-100/80'
                  }`}
                >
                  {minute.toString().padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview and Confirm */}
        <div className="px-4 pb-4">
          <div className="text-center mb-4">
            <span className="text-lg font-mono text-blue-50">
              {selectedHour.toString().padStart(2, '0')}:{selectedMinute.toString().padStart(2, '0')}
            </span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              className="flex-1"
            >
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
