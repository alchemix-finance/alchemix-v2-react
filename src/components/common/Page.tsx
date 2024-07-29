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
      <div className="flex items-center gap-6 border-b border-grey5inverse p-8 dark:border-grey5">
        <img
          src={iconUri}
          alt={`${title} icon`}
          className="h-20 w-20 invert dark:filter-none"
        />
        <div>
          <h1 className="mb-2 font-alcxTitles text-2xl tracking-wider">
            {title}
          </h1>
          <p className="text-sm text-lightgrey10">{description}</p>
        </div>
      </div>
      <div className="flex-grow px-4 pb-36 pt-4 md:px-8 md:pt-8">
        {children}
      </div>
    </div>
  );
};
