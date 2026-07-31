import { Card, CardContent } from '../components/ui/Card';
import { Briefcase, Calendar, AlertCircle, FileText, Repeat } from 'lucide-react';
import { motion } from 'motion/react';

export function Statistics() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
            <Briefcase className="text-emerald-500" size={24} />
            <h4 className="text-xs font-semibold text-slate-500 uppercase">Dias Trabalhados</h4>
            <p className="text-3xl font-bold text-slate-900">14</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
            <Calendar className="text-blue-500" size={24} />
            <h4 className="text-xs font-semibold text-slate-500 uppercase">Dias de Folga</h4>
            <p className="text-3xl font-bold text-slate-900">6</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="bg-rose-100 p-2 rounded-lg">
                <AlertCircle className="text-rose-600" size={20} />
              </div>
              <span className="font-semibold text-slate-700">Pendências Totais</span>
            </div>
            <span className="text-xl font-bold text-slate-900">2</span>
          </div>

          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <FileText className="text-amber-600" size={20} />
              </div>
              <span className="font-semibold text-slate-700">Justificativas</span>
            </div>
            <span className="text-xl font-bold text-slate-900">1</span>
          </div>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <Repeat className="text-indigo-600" size={20} />
              </div>
              <span className="font-semibold text-slate-700">Mudanças de Turma</span>
            </div>
            <span className="text-xl font-bold text-slate-900">0</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
