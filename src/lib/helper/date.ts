import moment from 'moment';

export function formatDateShort(date: Date) {
  return moment(date).format('YYYY-MM-DD HH:mm');
}