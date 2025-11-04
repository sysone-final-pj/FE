import group1350 from '@/assets/dashboard/group-1350.svg';
import pajamasArrowUp from '@/assets/dashboard/pajamas-arrow-up0.svg';
import vector0 from '@/assets/dashboard/vector0.svg';
import zr10650 from '@/assets/dashboard/zr-15-cls-10650.svg';
import zr10660 from '@/assets/dashboard/zr-15-cls-10660.svg';
import zr10670 from '@/assets/dashboard/zr-15-cls-10670.svg';

import type { DashboardContainerDetail } from '@/entities/container/model/types';

interface DashboardDetailPanelProps {
  container?: DashboardContainerDetail;
  onClose?: () => void;
}

export const DashboardDetailPanel = ({ container, onClose }: DashboardDetailPanelProps) => {
  return (
    <div
      className="
        w-full
        rounded-xl
      "
    >
      {/* Header */}
      <div className="pt-0 pl-[26px]">
        <p className="text-[#767676] font-pretendard font-semibold text-xl pb-2">
          Agent : node-name-01
        </p>
        <div className="flex items-center gap-2">
          <p className="text-[#505050] text-[28px] font-semibold">
            Container : web-service-01
          </p>
          <div className="w-0.5 h-7 bg-[#b9b9c9]" />
          <p className="text-[#505050] text-[28px] font-semibold">
            517faace4256
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="flex gap-2 mt-[14px]">
        {[
          { title: 'CPU', main: '20%', sub: '현재 : 33% / 최대 : 100%' },
          { title: 'Memory', main: '2.533 MB', sub: '현재 : 2.54 MB / 최대 : 4 GB' },
          { title: 'State', main: 'Running', sub: 'Uptime : 00d 00h 00m' },
          { title: 'Healthy', main: 'Healthy', sub: '응답시간 : 00ms / 에러율 : 00%' },
        ].map((card) => (
          <div
            key={card.title}
            className="bg-white w-[214px] rounded-xl border border-[#ebebf1] p-4"
          >
            <div className="border-b border-[#ebebf1] pb-3 px-3 mb-4">
              <p className="text-[#505050] font-semibold text-xl">{card.title}</p>
            </div>
            <div className="px-3">
              <p className="text-[#767676] font-semibold text-2xl">{card.main}</p>
              <p className="text-[#999999] text-xs text-center mt-1">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Network */}
      <div className="mt-3.5 bg-white w-[883px] h-[308px] rounded-xl border border-[#ebebf1] p-4">
        <div className="flex items-center gap-2 border-b border-[#ebebf1] pb-3 px-3 mb-4">
          <p className="text-[#505050] font-semibold text-xl">Network</p>
          <div className="flex items-center gap-3 ml-4">
            <div className="bg-white rounded-lg px-2.5 py-[5px] flex items-center gap-1.5">
              <img src={pajamasArrowUp} className="w-4 h-4" />
              <p className="text-[#767676] text-sm">Rx</p>
              <p className="text-[#0492f4] text-sm">24.2</p>
              <p className="text-[#767676] text-xs">Kbps</p>
            </div>
            <div className="text-[#767676] text-xs">|</div>
            <div className="bg-white rounded-lg px-2.5 py-[5px] flex items-center gap-1.5">
              <img src={vector0} className="w-[8px] h-3.5" />
              <p className="text-[#767676] text-sm">Tx</p>
              <p className="text-[#14ba6d] text-sm">24.2</p>
              <p className="text-[#767676] text-xs">Kbps</p>
            </div>
          </div>
        </div>
        <img src={zr10650} className="w-full h-[225px] object-cover" />
      </div>

      {/* Images + Read&Write */}
      <div className="flex mt-4 gap-2">
        {/* Images */}
        <div className="bg-white w-[310px] h-[203px] rounded-xl border border-[#ebebf1] p-4">
          <div className="border-b border-[#ebebf1] pb-3 px-3 mb-4">
            <p className="text-[#505050] font-semibold text-xl">IMAGES</p>
          </div>
          <div className="space-y-2 text-sm text-[#767676] px-3">
            <div className="flex justify-between">
              <span>REPOSITORY</span>
              <span className="text-[#505050]">backend-api</span>
            </div>
            <div className="flex justify-between">
              <span>TAG</span>
              <span className="text-[#505050]">latest</span>
            </div>
            <div className="flex justify-between">
              <span>IMAGE ID</span>
              <span className="text-[#505050]">f1e2d3c4b5a6</span>
            </div>
            <div className="flex justify-between">
              <span>SIZE</span>
              <span className="text-[#505050]">278 MB</span>
            </div>
          </div>
        </div>

        {/* Read & Write */}
        <div className="bg-white w-[567px] h-[203px] rounded-xl border border-[#ebebf1] p-4">
          <div className="border-b border-[#ebebf1] pb-3 px-3 flex items-center">
            <p className="text-[#505050] font-medium text-xl">Read & Write</p>
            <div className="flex items-center gap-2 text-sm text-[#767676] ml-5">
              <span>
                Read : <span className="text-[#8979ff]">9</span> MB/s
              </span>
              <span>|</span>
              <span>
                Write : <span className="text-[#ff928a]">24.2</span> MB/s
              </span>
            </div>
          </div>
          <div className="relative h-[125px]">
            <img src={zr10650} className="absolute w-[84%] left-[8%] top-[12%]" />
            <img src={zr10660} className="absolute w-[72%] left-[11%] top-[19%]" />
            <img src={zr10670} className="absolute w-[72%] left-[17%] top-[13%]" />
          </div>
        </div>
      </div>

      {/* Event Summary + Storage Usage */}
      <div className="flex mt-2 gap-2">
        {/* Event Summary */}
        <div className="bg-white w-[530px] h-[150px] rounded-xl border border-[#ebebf1] p-4">
          <div className="border-b border-[#ebebf1] pb-3 px-3 flex justify-between items-center">
            <p className="text-[#505050] font-semibold text-xl">Event Summary</p>
            <div className="text-xs text-[#555555]">Total 100</div>
          </div>
          <div className="flex justify-between items-center mt-4 px-3">
            <p className="text-xs text-[#767676]">Event 기준 00d 00h</p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 border border-[#ebebf1] rounded-xl px-2.5 py-1">
                <span className="text-xs text-[#555555]">Normal</span>
                <span className="text-xs text-[#767676]">80</span>
              </div>
              <div className="flex items-center gap-2 border border-[#ebebf1] rounded-xl px-2.5 py-1">
                <span className="text-xs text-[#555555]">Error</span>
                <span className="text-xs text-[#767676]">20</span>
              </div>
            </div>
          </div>
        </div>

        {/* Storage Usage */}
        <div className="bg-white w-[345px] h-[150px] rounded-xl border border-[#ebebf1] p-4 flex items-center">
          <div className="border-b border-[#ebebf1] pb-3 px-3 flex justify-between items-center">
            <p className="text-[#505050] font-semibold text-xl">Event Summary</p>
          </div>
          <div className="flex gap-[18px] items-center">
            <div className="relative w-[62px] h-[62px]">
              <img src={group1350} className="absolute w-[62px] h-[62px]" />
              <div className="absolute top-[30px] left-[37px] flex items-center gap-1">
                <p className="text-[#767676] text-sm font-medium">20</p>
                <p className="text-[#767676] text-[10px] font-semibold">%</p>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-[#767676] mb-1">
                <div className="w-2 h-2 bg-[#0199ee]" />
                <p>사용 중인 공간 : 2 GB</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#767676]">
                <div className="w-2 h-2 bg-[#c3c3c3]" />
                <p>여유 공간 : 10 GB</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
