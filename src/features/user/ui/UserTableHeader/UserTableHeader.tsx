export interface TableHeaderColumn {
  key: string;
  label: string;
  width: string;
  align?: 'left' | 'center' | 'right';
}

interface UserTableHeaderProps {
  readonly columns: readonly TableHeaderColumn[];
}

export const UserTableHeader = ({ columns }: UserTableHeaderProps) => {
  return (
    <div className="flex items-center w-full h-12 bg-gray-100 rounded-lg px-5">
      {columns.map((column) => (
        <div
          key={column.key}
          className="text-sm font-medium text-gray-600"
          style={{
            width: column.width,
            textAlign: column.align || 'left',
          }}
        >
          {column.label}
        </div>
      ))}
    </div>
  );
};
