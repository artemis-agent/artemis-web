"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function UserNav() {
  const { user, logout } = useAuth();
  const initials = user
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button className="outline-none">
            <Avatar className="h-7 w-7 cursor-pointer">
              <AvatarFallback className="bg-muted text-foreground text-[10px] font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          className="cursor-pointer gap-2"
          onClick={() => (window.location.href = "/dashboard/profile")}
        >
          <User className="h-3.5 w-3.5" />
          My Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer gap-2"
          onClick={logout}
        >
          <LogOut className="h-3.5 w-3.5" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
