import Rive from "@rive-app/react-canvas";

export const RiveSection = () => {
  return (
    <div className="flex flex-col justify-center gap-4 xl:flex-row">
      <Rive
        className="h-[330px] w-[330px] xl:h-44 xl:w-44 2xl:h-[330px] 2xl:w-[330px]"
        src="/riv/1_deposit.riv"
        stateMachines="State Machine 1"
      />
      <Rive
        className="h-[330px] w-[330px] xl:h-44 xl:w-44 2xl:h-[330px] 2xl:w-[330px]"
        src="/riv/2_auto.riv"
        stateMachines="State Machine 1"
      />
      <Rive
        className="h-[330px] w-[330px] xl:h-44 xl:w-44 2xl:h-[330px] 2xl:w-[330px]"
        src="/riv/3_access.riv"
        stateMachines="State Machine 1"
      />
    </div>
  );
};
