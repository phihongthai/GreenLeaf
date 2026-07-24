'use client';

import Link from 'next/link';

const TABS = [
  { key: 'homework', label: '✍️ Homework', href: '/teacher/homework' },
  { key: 'resources', label: '📁 Resource Library', href: '/teacher/resources' },
  { key: 'students', label: '👩‍🎓 Students', href: '/teacher/students' },
];

export default function TeacherNav({ active }: { active: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2 bg-white rounded-full p-1 shadow-sm">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={`text-sm font-bold px-4 py-1.5 rounded-full transition-colors ${
              active === t.key ? 'bg-[#3A7D44] text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
