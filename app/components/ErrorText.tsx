export default function ErrorText({ message, tone = 'error' }: { message: string; tone?: 'error' | 'warning' }) {
  return (
    <p className={`text-xs ${tone === 'error' ? 'text-red-500' : 'text-amber-600'}`}>{message}</p>
  );
}
