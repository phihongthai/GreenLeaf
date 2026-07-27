// Minh hoạ nền: cây cổ thụ ở góc trái, vườn cỏ xanh bên phải, cầu vồng + chân trời phía xa
// trên cao — thuần SVG, không cần ảnh có sẵn. Đặt trong 1 cha `relative`, tự absolute +
// pointer-events-none nên không chặn click, tương tự FloatingDecor. Nên đặt trước
// FloatingDecor trong JSX để hoạ tiết trôi nổi hiện phía trên cảnh nền này.
export default function SceneBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Cầu vồng + chân trời, phía xa trên cao — đặt lùi lên trên, chỉ hé lộ phần dưới cùng */}
      <svg
        className="absolute left-1/2 -translate-x-1/2 -top-24 w-[140%] max-w-4xl opacity-[0.12]"
        viewBox="0 0 400 160"
        fill="none"
      >
        <path d="M 40 160 A 160 160 0 0 1 360 160" stroke="#F87171" strokeWidth="7" />
        <path d="M 56 160 A 144 144 0 0 1 344 160" stroke="#FB923C" strokeWidth="7" />
        <path d="M 72 160 A 128 128 0 0 1 328 160" stroke="#FACC15" strokeWidth="7" />
        <path d="M 88 160 A 112 112 0 0 1 312 160" stroke="#4ADE80" strokeWidth="7" />
        <path d="M 104 160 A 96 96 0 0 1 296 160" stroke="#60A5FA" strokeWidth="7" />
        <path d="M 120 160 A 80 80 0 0 1 280 160" stroke="#C084FC" strokeWidth="7" />
      </svg>

      {/* Cây cổ thụ, góc trái */}
      <svg
        className="absolute -left-6 bottom-0 w-40 sm:w-56 md:w-64 opacity-80"
        viewBox="0 0 200 260"
        fill="none"
      >
        <rect x="90" y="140" width="20" height="120" rx="8" fill="#8B6544" />
        <circle cx="100" cy="112" r="70" fill="#3A7D44" />
        <circle cx="52" cy="142" r="46" fill="#4C9A56" />
        <circle cx="148" cy="142" r="46" fill="#4C9A56" />
        <circle cx="100" cy="72" r="50" fill="#63B36C" />
        <circle cx="75" cy="96" r="6" fill="#C9A876" />
        <circle cx="128" cy="82" r="5" fill="#C9A876" />
        <circle cx="103" cy="132" r="5" fill="#C9A876" />
      </svg>

      {/* Vườn cỏ xanh, góc phải */}
      <svg
        className="absolute -right-4 bottom-0 w-48 sm:w-64 md:w-80 opacity-70"
        viewBox="0 0 320 140"
        fill="none"
      >
        <ellipse cx="160" cy="170" rx="200" ry="80" fill="#5EAE5A" />
        <ellipse cx="195" cy="165" rx="150" ry="55" fill="#6FBE68" />
        <path d="M40 120 q6 -20 12 0" stroke="#3A7D44" strokeWidth="4" strokeLinecap="round" />
        <path d="M62 124 q6 -24 12 0" stroke="#3A7D44" strokeWidth="4" strokeLinecap="round" />
        <path d="M92 118 q6 -18 12 0" stroke="#3A7D44" strokeWidth="4" strokeLinecap="round" />
        <path d="M152 122 q6 -22 12 0" stroke="#3A7D44" strokeWidth="4" strokeLinecap="round" />
        <path d="M202 116 q6 -18 12 0" stroke="#3A7D44" strokeWidth="4" strokeLinecap="round" />
        <path d="M252 120 q6 -20 12 0" stroke="#3A7D44" strokeWidth="4" strokeLinecap="round" />
        <circle cx="72" cy="108" r="4" fill="#F4A6C6" />
        <circle cx="182" cy="104" r="4" fill="#FFD873" />
        <circle cx="262" cy="108" r="4" fill="#F4A6C6" />
      </svg>
    </div>
  );
}
