import { Heart } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600">
        <Heart className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-sm font-bold leading-tight text-dark dark:text-white">ห้องพยาบาล</p>
        <p className="text-[10px] leading-tight text-gray-500">Hospital Room</p>
      </div>
    </div>
  );
}
