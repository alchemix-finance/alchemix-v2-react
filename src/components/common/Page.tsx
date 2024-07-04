export const Page = ({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
}) => {
  return (
    <div className="flex h-full flex-col py-5">
      {title && (
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          {title}
        </h1>
      )}
      {description && <p className="text-xl">{description}</p>}
      <div className="mt-3 flex-grow p-5">{children}</div>
    </div>
  );
};
