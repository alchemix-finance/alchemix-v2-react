export const Page = ({
  children,
  title,
  description,
  iconUri,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
  iconUri: string;
}) => {
  return (
    <div className="flex h-full flex-col py-5">
      <div className="flex items-center gap-6 border-b border-grey5inverse p-8">
        <img src={iconUri} alt={`${title} icon`} className="h-20 w-20 invert" />
        <div>
          <h1 className="mb-2 font-alcxTitles text-2xl tracking-wider">
            {title}
          </h1>
          <p className="text-sm text-lightgrey10">{description}</p>
        </div>
      </div>
      <div className="mt-3 flex-grow p-5">{children}</div>
    </div>
  );
};
