import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 안전하게 날짜를 포맷팅하는 유틸리티 함수
 */
export function safeFormatDate(
  dateString: string | undefined | null,
  formatString: string = 'yyyy-MM-dd'
): string {
  if (!dateString) {
    return '날짜 없음';
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '날짜 없음';
    }
    return format(date, formatString, { locale: ko });
  } catch (error) {
    return '날짜 없음';
  }
}

/**
 * 날짜가 유효한지 확인
 */
export function isValidDate(dateString: string | undefined | null): boolean {
  if (!dateString) {
    return false;
  }
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}
