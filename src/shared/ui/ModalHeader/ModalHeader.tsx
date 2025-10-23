interface ModalHeaderProps {
  title: string;
}

export const ModalHeader = ({ title }: ModalHeaderProps) => {
  return (
    <div className="h-14 px-8 border-b border-gray-200 flex items-center">
      <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
    </div>
  );
};
