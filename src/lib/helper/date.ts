import moment from 'moment';

export function formatDateShort(date: Date | string) {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return moment(date).format('YYYY-MM-DD HH:mm');
}

export function formatDateLong(date: Date | string) {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
}
