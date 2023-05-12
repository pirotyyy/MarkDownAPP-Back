import { MdInfo } from 'src/share/models/mdInfo.model';

export const MdInfoFormatter = (item: any): MdInfo => {
  const date = new Date(parseInt(item.CreatedAt.N));
  const mdInfo = {
    mdId: item.PK.S.slice(3),
    title: item.Title.S,
    userId: item.Data.S.slice(1),
    fileId: item.FileId.S,
    createdAt: date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
  };

  return mdInfo;
};
