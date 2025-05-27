export type ModalType = "error" | "success" | "warn" | "timer";

export interface BaseModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export interface TimerModalProps extends BaseModalProps {
  duration?: number;
  onComplete?: () => void;
  pollStatus?: () => Promise<boolean>;
}

export type AppModalProps = {type: "timer"} & TimerModalProps;
