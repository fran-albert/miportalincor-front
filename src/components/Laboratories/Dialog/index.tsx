import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Label } from "@/components/ui/label";

const LabDialog = ({
  setDates,
  dates,
  onSetDate,
  onAddNewColumn,
  onSetNote,
}: {
  setDates: (dates: string[]) => void;
  dates: string[];
  onAddNewColumn: () => void;
  onSetDate: (date: string) => void;
  onSetNote: (note: string) => void;
}) => {
  const [newDate, setNewDate] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState<string>("");
  const handleSave = () => {
    if (newDate) {
      setDates([...dates, newDate]);
      setNewDate(null);
      onSetNote(note);
      onSetDate(newDate);
      setIsOpen(false);
      onAddNewColumn();
    }
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-greenPrimary hover:bg-teal-700 text-white px-4 py-2 ml-2 rounded-md shadow-lg flex items-center"
          >
            Agregar Laboratorio
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Laboratorio</DialogTitle>
            <DialogDescription>
              Proporcione una nota del laboratorio y la fecha.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label
              htmlFor="comment"
              className="block text-black font-medium mb-2"
            >
              Nota
            </Label>
            <Input
              placeholder="Escriba una nota sobre el laboratorio..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Label
              htmlFor="comment"
              className="block text-black font-medium mb-2"
            >
              Fecha del Laboratorio
            </Label>
            <Input
              type="date"
              placeholder="Fecha"
              value={newDate || ""}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={handleSave}
              className="bg-greenPrimary hover:bg-teal-700"
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LabDialog;
