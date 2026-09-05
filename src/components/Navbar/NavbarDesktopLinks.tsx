import Link from "next/link";
import type { NavbarController } from "./useNavbarController";

type NavbarDesktopLinksProps = Pick<
  NavbarController,
  "visibleLinks" | "isNavLinkActive"
>;

export function NavbarDesktopLinks({
  visibleLinks,
  isNavLinkActive,
}: NavbarDesktopLinksProps) {
  return (
    <div className="hidden min-w-0 flex-1 items-center justify-center px-5 lg:flex">
      <div className="flex items-center gap-1.5">
        {visibleLinks.map((link) => {
          const isActive = isNavLinkActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={`group relative inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-bold transition-all duration-300 ${
                isActive
                  ? "bg-primary-soft text-primary-container"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
              }`}
            >
              <span
                className="material-symbols-outlined text-[17px] transition-transform duration-300 group-hover:scale-110"
                style={{
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {link.icon}
              </span>
              <span className="whitespace-nowrap">{link.label}</span>
              {isActive && (
                <span className="absolute -bottom-[2px] right-1/2 h-1 w-1 translate-x-1/2 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
