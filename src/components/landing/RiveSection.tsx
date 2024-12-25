import Rive from "@rive-app/react-canvas";

export const RiveSection = () => {
  return (
    <div className="flex justify-center gap-4">
      <Rive
        className="h-[330px] w-[330px]"
        src="/riv/1_deposit.riv"
        stateMachines="State Machine 1"
      />
      <Rive
        className="h-[330px] w-[330px]"
        src="/riv/2_auto.riv"
        stateMachines="State Machine 1"
      />
      <Rive
        className="h-[330px] w-[330px]"
        src="/riv/3_access.riv"
        stateMachines="State Machine 1"
      />
    </div>
  );
};
