import type { Reminder } from '@/lib/reminders';
import ReminderCard from './ReminderCard';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from '../ui/badge';

interface ReminderListProps {
  reminders: Reminder[];
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
  isDemo?: boolean;
}

export default function ReminderList({ reminders, onToggle, onDelete, isDemo = false }: ReminderListProps) {
  return (
    <div className="space-y-4">
      {isDemo && <Badge variant="outline" className='mb-4'>Demo Reminders</Badge>}
      <AnimatePresence>
        {reminders.map((reminder, index) => (
          <motion.div
            key={reminder.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: 'spring', stiffness: 500, damping: 50 }}
          >
            <ReminderCard
              reminder={reminder}
              onToggle={onToggle}
              onDelete={onDelete}
              isDemo={isDemo}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
