import { Toaster as Sonner } from "sonner";
import { useTheme } from "../providers/ThemeProvider";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { darkMode } = useTheme();

  return (
    <Sonner
      theme={darkMode ? "dark" : "light"}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "font-['Montserrat'] group toast group-[.toaster]:bg-white group-[.toaster]:text-white2inverse group-[.toaster]:border-neutral-200 group-[.toaster]:shadow-lg dark:group-[.toaster]:bg-neutral-950 dark:group-[.toaster]:text-white2 dark:group-[.toaster]:border-neutral-800",
          description:
            "font-['Montserrat'] group-[.toast]:text-neutral-500 dark:group-[.toast]:text-neutral-400",
          actionButton:
            "font-['Montserrat'] group-[.toast]:bg-neutral-900 group-[.toast]:text-neutral-50 dark:group-[.toast]:bg-neutral-50 dark:group-[.toast]:text-neutral-900",
          cancelButton:
            "font-['Montserrat'] group-[.toast]:bg-neutral-100 group-[.toast]:text-neutral-500 dark:group-[.toast]:bg-neutral-800 dark:group-[.toast]:text-neutral-400",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
