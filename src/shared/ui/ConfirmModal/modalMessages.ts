import type { ConfirmModalType } from './ConfirmModal';

export interface ModalMessage {
  header: string;
  content: string;
  type: ConfirmModalType;
}

/**
 * 공통 모달 메시지 모음
 * 프로젝트 전체에서 사용되는 모든 모달 메시지를 중앙 관리
 */
export const MODAL_MESSAGES = {
  // ========================================
  // 1. 사용자 관리 (User Management)
  // ========================================
  USER: {
    // 입력 검증
    ADD_REQUIRED_FIELDS: {
      header: '입력 오류',
      content: '필수 항목을 모두 입력해주세요.\n(사용자명, 비밀번호, 이름, 이메일)',
      type: 'confirm' as ConfirmModalType
    },
    EDIT_REQUIRED_FIELDS: {
      header: '입력 오류',
      content: '필수 항목을 모두 입력해주세요.\n(이름, 이메일)',
      type: 'confirm' as ConfirmModalType
    },
    USERNAME_CHECK_REQUIRED: {
      header: '중복 확인 필요',
      content: '사용자명 중복 확인을 완료해주세요.',
      type: 'confirm' as ConfirmModalType
    },
    USERNAME_DUPLICATE: {
      header: '사용자명 중복',
      content: '이미 사용 중인 사용자명입니다.\n다른 사용자명을 입력해주세요.' ,
      type: 'confirm' as ConfirmModalType
    },
    PASSWORD_MISMATCH: {
      header: '비밀번호 불일치',
      content: '비밀번호와 비밀번호 확인이\n일치하지 않습니다.',
      type: 'confirm' as ConfirmModalType
    },
    PASSWORD_LENGTH_ERROR: {
      header: '비밀번호 길이 오류',
      content: '비밀번호는 최소 3자 이상이어야 합니다.',
      type: 'confirm' as ConfirmModalType
    },
    
    // 삭제 확인
    DELETE_CONFIRM: {
      header: '사용자 삭제',
      content: '선택한 사용자를 삭제하시겠습니까?\n삭제된 사용자 정보는 복구할 수 없습니다.',
      type: 'delete' as ConfirmModalType
    },
    
    // 성공 메시지
    ADD_SUCCESS: {
      header: '사용자 추가 완료',
      content: '새로운 사용자가 성공적으로 추가되었습니다.',
      type: 'confirm' as ConfirmModalType
    },
    EDIT_SUCCESS: {
      header: '사용자 정보 수정 완료',
      content: '사용자 정보가 성공적으로 수정되었습니다.',
      type: 'confirm' as ConfirmModalType
    },

    DELETE_SUCCESS: {
      header: 'User Deleted',
      content: 'The user has been successfully deleted.',
      type: 'confirm' as const,
    },
    DELETE_FAIL: {
      header: 'Delete Failed',
      content: 'An error occurred while deleting the user.',
      type: 'confirm' as const,
    },
  },

  // ========================================
  // 2. 에이전트 관리 (Agent Management)
  // ========================================
  AGENT: {
    // 입력 검증
    REQUIRED_FIELDS: {
      header: '입력 오류',
      content: '필수 항목을 모두 입력해주세요.\n(에이전트명, API 엔드포인트)',
      type: 'confirm' as ConfirmModalType
    },
    TOKEN_CONFIRM: {
      header: '토큰 정보 미입력',
      content: '인증 토큰 정보를 입력하지 않았습니다.\n이대로 추가하시겠습니까?',
      type: 'complete' as ConfirmModalType
    },
    
    // 삭제 확인
    DELETE_CONFIRM: {
      header: '에이전트 삭제',
      content: '선택한 에이전트를 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.',
      type: 'delete' as ConfirmModalType
    },
    
    // 성공 메시지
    ADD_SUCCESS: {
      header: '에이전트 추가 완료',
      content: '새로운 에이전트가 성공적으로 추가되었습니다.',
      type: 'confirm' as ConfirmModalType
    },
    EDIT_SUCCESS: {
      header: '에이전트 정보 수정 완료',
      content: '에이전트 정보가 성공적으로 수정되었습니다.',
      type: 'confirm' as ConfirmModalType
    }
  },

  // ========================================
  // 3. 알림 규칙 관리 (Alert Rule Management)
  // ========================================
  ALERT_RULE: {
    // 입력 검증
    REQUIRED_FIELDS: {
      header: '입력 오류',
      content: '필수 항목을 모두 입력해주세요.\n(규칙명, 메트릭, 임계값)',
      type: 'confirm' as ConfirmModalType
    },
    
    // 삭제 확인
    DELETE_CONFIRM: {
      header: '알림 규칙 삭제',
      content: '선택한 알림 규칙을 삭제하시겠습니까?\n삭제된 규칙은 복구할 수 없습니다.',
      type: 'delete' as ConfirmModalType
    },
    
    // 성공 메시지
    ADD_SUCCESS: {
      header: '알림 규칙 추가 완료',
      content: '새로운 알림 규칙이 성공적으로 추가되었습니다.',
      type: 'confirm' as ConfirmModalType
    },
    EDIT_SUCCESS: {
      header: '알림 규칙 수정 완료',
      content: '알림 규칙이 성공적으로 수정되었습니다.',
      type: 'confirm' as ConfirmModalType
    }
  },

  // ========================================
  // 4. 컨테이너 관리 (Container Management)
  // ========================================
  CONTAINER: {
    DELETE_CONFIRM: {
      header: '컨테이너 삭제',
      content: '선택한 컨테이너를 삭제하시겠습니까?\n실행 중인 컨테이너는 중지됩니다.',
      type: 'delete' as ConfirmModalType
    }
  },

  // ========================================
  // 5. 시스템 공통 (System Common)
  // ========================================
  SYSTEM: {
    // 로그아웃
    LOGOUT_CONFIRM: {
      header: '로그아웃',
      content: '로그아웃 하시겠습니까?',
      type: 'complete' as ConfirmModalType
    },
    
    // 필터 초기화
    FILTER_RESET_CONFIRM: {
      header: '필터 초기화',
      content: '모든 필터를 초기화하시겠습니까?',
      type: 'complete' as ConfirmModalType
    },
    
    // API 오류
    API_CONNECTION_ERROR: {
      header: '연결 오류',
      content: '서버와의 연결에 실패했습니다.\n잠시 후 다시 시도해주세요.',
      type: 'confirm' as ConfirmModalType
    },
    PERMISSION_ERROR: {
      header: '권한 오류',
      content: '해당 작업을 수행할 권한이 없습니다.',
      type: 'confirm' as ConfirmModalType
    },
    SESSION_EXPIRED: {
      header: '세션 만료',
      content: '로그인 세션이 만료되었습니다.\n다시 로그인해주세요.',
      type: 'confirm' as ConfirmModalType
    }
  }
} as const;

/**
 * 메시지 타입 헬퍼
 * TypeScript 자동완성을 위한 타입 추출
 */
export type ModalMessageKey = keyof typeof MODAL_MESSAGES;
export type UserMessageKey = keyof typeof MODAL_MESSAGES.USER;
export type AgentMessageKey = keyof typeof MODAL_MESSAGES.AGENT;
export type AlertRuleMessageKey = keyof typeof MODAL_MESSAGES.ALERT_RULE;
export type ContainerMessageKey = keyof typeof MODAL_MESSAGES.CONTAINER;
export type SystemMessageKey = keyof typeof MODAL_MESSAGES.SYSTEM;