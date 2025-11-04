interface ImageInfoCardProps {
  repository?: string;
  tag?: string;
  imageId?: string;
  size?: string;
}

export const ImageInfoCard = ({
  repository = 'backend-api',
  tag = 'latest',
  imageId = 'f1e2d3c4b5a6',
  size = '278 MB'
}: ImageInfoCardProps) => {
  return (
    <div className="bg-white w-[310px] h-[203px] rounded-xl border border-[#ebebf1] p-4">
      <div className="border-b border-[#ebebf1] pb-3 px-3 mb-4">
        <p className="text-[#505050] font-semibold text-xl">IMAGES</p>
      </div>
      <div className="space-y-2 text-sm text-[#767676] px-3">
        <div className="flex justify-between">
          <span>REPOSITORY</span>
          <span className="text-[#505050]">{repository}</span>
        </div>
        <div className="flex justify-between">
          <span>TAG</span>
          <span className="text-[#505050]">{tag}</span>
        </div>
        <div className="flex justify-between">
          <span>IMAGE ID</span>
          <span className="text-[#505050]">{imageId}</span>
        </div>
        <div className="flex justify-between">
          <span>SIZE</span>
          <span className="text-[#505050]">{size}</span>
        </div>
      </div>
    </div>
  );
};
