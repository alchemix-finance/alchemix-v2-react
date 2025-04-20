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
    <div className="flex h-full flex-col">
      <div className="border-grey5inverse dark:border-grey5 flex items-center gap-6 border-b p-8">
        <img
          src={iconUri}
          alt={`${title} icon`}
          className="h-20 w-20 invert dark:filter-none"
        />
        <div>
          <h1 className="font-alcxTitles mb-2 text-2xl tracking-wider">
            {title}
          </h1>
          <p className="text-lightgrey10 text-sm">{description}</p>
        </div>
      </div>
      <div className="grow px-4 pt-4 pb-36 md:px-8 md:pt-8">{children}</div>
    </div>
  );
};
