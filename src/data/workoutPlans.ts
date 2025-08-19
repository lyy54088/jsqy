// 健身计划数据定义

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  description: string;
  tips: string[];
  restTime?: string;
}

export interface WorkoutDay {
  id: string;
  name: string;
  type: 'workout' | 'rest' | 'active_recovery';
  targetMuscles: string[];
  warmup: {
    duration: number; // 分钟
    activities: string[];
  };
  exercises: Exercise[];
  cooldown: {
    duration: number; // 分钟
    stretches: string[];
  };
  estimatedDuration: number; // 分钟
}

export interface WeeklyPlan {
  id: string;
  name: string;
  description: string;
  frequency: string;
  days: WorkoutDay[];
  totalDays: number;
  restDays?: number; // 休息天数
  estimatedDuration?: number; // 预估总时长
}

// 默认训练计划
export const defaultWeeklyPlan: WeeklyPlan = {
  id: 'default-plan',
  name: '标准健身计划',
  description: '适合初中级健身者的全面训练计划，每周4-5天训练，2-3天休息',
  frequency: '每周训练4-5天，留2-3天休息',
  totalDays: 7,
  days: [
    {
      id: 'monday',
      name: '周一：上肢推力',
      type: 'workout',
      targetMuscles: ['胸肌', '肩膀', '三头肌'],
      warmup: {
        duration: 10,
        activities: ['开合跳', '手臂绕环', '轻重量卧推激活']
      },
      exercises: [
        {
          name: '杠铃卧推',
          sets: 4,
          reps: '8-10次（增肌）/12-15次（塑形）',
          description: '胸肌主要训练动作',
          tips: ['保持肩胛骨收紧', '下降时控制速度', '推起时呼气'],
          restTime: '90秒'
        },
        {
          name: '上斜杠铃卧推',
          sets: 3,
          reps: '10-12次',
          description: '针对胸肌上部',
          tips: ['角度控制在30-45度', '杠铃轨迹垂直向上'],
          restTime: '60秒'
        },
        {
          name: '坐姿肩推',
          sets: 3,
          reps: '10次',
          description: '肩膀主要训练动作',
          tips: ['背部贴紧椅背', '推起时不要完全锁死肘关节'],
          restTime: '60秒'
        },
        {
          name: '侧平举',
          sets: 3,
          reps: '12-15次',
          description: '肩膀中束训练',
          tips: ['控制重量', '动作要慢', '顶峰收缩1秒'],
          restTime: '45秒'
        },
        {
          name: '绳索下压（三头肌）',
          sets: 3,
          reps: '12次',
          description: '三头肌孤立训练',
          tips: ['肘关节固定', '只有前臂移动'],
          restTime: '45秒'
        }
      ],
      cooldown: {
        duration: 5,
        stretches: ['胸肌拉伸30秒', '肩膀拉伸30秒', '三头肌拉伸30秒']
      },
      estimatedDuration: 60
    },
    {
      id: 'tuesday',
      name: '周二：下肢训练',
      type: 'workout',
      targetMuscles: ['腿部', '臀部'],
      warmup: {
        duration: 10,
        activities: ['高抬腿', '弓步走', '深蹲激活']
      },
      exercises: [
        {
          name: '杠铃深蹲',
          sets: 4,
          reps: '8-10次',
          description: '腿部王牌动作',
          tips: ['膝盖与脚尖同向', '下蹲至大腿平行地面', '核心收紧'],
          restTime: '120秒'
        },
        {
          name: '硬拉',
          sets: 3,
          reps: '6-8次（增肌）/10次（塑形）',
          description: '后链肌群训练',
          tips: ['保持背部挺直', '杠铃贴近身体', '臀部主导发力'],
          restTime: '120秒'
        },
        {
          name: '腿举',
          sets: 3,
          reps: '12-15次',
          description: '安全的腿部训练',
          tips: ['脚掌位置适中', '下降时控制速度'],
          restTime: '90秒'
        },
        {
          name: '箭步蹲',
          sets: 3,
          reps: '每侧10次',
          description: '单腿训练，改善不平衡',
          tips: ['前腿承重', '后腿轻触地面', '保持躯干直立'],
          restTime: '60秒'
        }
      ],
      cooldown: {
        duration: 8,
        stretches: ['大腿前侧拉伸', '大腿后侧拉伸', '臀部拉伸', '小腿拉伸']
      },
      estimatedDuration: 75
    },
    {
      id: 'wednesday',
      name: '周三：轻松散步+核心激活',
      type: 'rest',
      targetMuscles: ['核心', '下肢'],
      warmup: { duration: 5, activities: ['原地踏步', '关节活动'] },
      exercises: [
        {
          name: '轻松散步',
          sets: 1,
          reps: '15分钟',
          description: '低强度有氧恢复',
          tips: ['保持轻松步伐', '呼吸自然', '可在户外或跑步机'],
          restTime: '0秒'
        },
        {
          name: '腹式呼吸',
          sets: 3,
          reps: '10次深呼吸',
          description: '激活核心肌群',
          tips: ['仰卧或坐姿', '手放腹部', '感受腹部起伏'],
          restTime: '30秒'
        },
        {
          name: '轻度平板支撑',
          sets: 2,
          reps: '20秒',
          description: '温和核心激活',
          tips: ['膝盖着地版本', '保持身体直线', '不要憋气'],
          restTime: '60秒'
        },
        {
          name: '站立侧弯',
          sets: 1,
          reps: '左右各10次',
          description: '侧腰拉伸',
          tips: ['站立双脚分开', '一手叉腰一手上举', '缓慢侧弯'],
          restTime: '30秒'
        }
      ],
      cooldown: { duration: 5, stretches: ['腿部拉伸', '深呼吸放松'] },
      estimatedDuration: 30
    },
    {
      id: 'thursday',
      name: '周四：上肢拉力',
      type: 'workout',
      targetMuscles: ['背部', '二头肌'],
      warmup: {
        duration: 10,
        activities: ['手臂绕环', '肩胛骨激活', '轻重量划船']
      },
      exercises: [
        {
          name: '引体向上/高位下拉',
          sets: 4,
          reps: '8-12次',
          description: '背部宽度训练',
          tips: ['肩胛骨下沉', '胸部挺起', '感受背部发力'],
          restTime: '90秒'
        },
        {
          name: '杠铃划船',
          sets: 4,
          reps: '8-10次',
          description: '背部厚度训练',
          tips: ['保持背部挺直', '肘部贴近身体', '拉至腹部'],
          restTime: '90秒'
        },
        {
          name: '坐姿划船',
          sets: 3,
          reps: '10-12次',
          description: '中背部训练',
          tips: ['挺胸收腹', '肩胛骨后收', '控制回程'],
          restTime: '60秒'
        },
        {
          name: '杠铃弯举',
          sets: 3,
          reps: '10-12次',
          description: '二头肌主要训练',
          tips: ['肘关节固定', '慢起慢放', '顶峰收缩'],
          restTime: '60秒'
        }
      ],
      cooldown: {
        duration: 5,
        stretches: ['背部拉伸', '二头肌拉伸', '肩部拉伸']
      },
      estimatedDuration: 65
    },
    {
      id: 'friday',
      name: '周五：核心+有氧',
      type: 'workout',
      targetMuscles: ['核心', '心肺'],
      warmup: {
        duration: 10,
        activities: ['轻松慢跑', '动态拉伸', '核心激活']
      },
      exercises: [
        {
          name: '平板支撑',
          sets: 3,
          reps: '30-60秒',
          description: '核心稳定性训练',
          tips: ['保持身体一条直线', '不要塌腰', '正常呼吸'],
          restTime: '60秒'
        },
        {
          name: '卷腹',
          sets: 3,
          reps: '15-20次',
          description: '腹直肌训练',
          tips: ['慢起慢放', '感受腹部收缩', '不要拉扯颈部'],
          restTime: '45秒'
        },
        {
          name: '有氧运动',
          sets: 1,
          reps: '20-30分钟',
          description: '心肺功能训练',
          tips: ['保持中等强度', '心率控制在65-75%', '可选择跑步、单车等'],
          restTime: '0秒'
        }
      ],
      cooldown: {
        duration: 10,
        stretches: ['全身拉伸', '深呼吸放松']
      },
      estimatedDuration: 50
    },
    {
      id: 'saturday',
      name: '周六：休息日',
      type: 'rest',
      targetMuscles: [],
      warmup: { duration: 0, activities: [] },
      exercises: [],
      cooldown: { duration: 0, stretches: [] },
      estimatedDuration: 0
    },
    {
      id: 'sunday',
      name: '周日：休息日',
      type: 'rest',
      targetMuscles: [],
      warmup: { duration: 0, activities: [] },
      exercises: [],
      cooldown: { duration: 0, stretches: [] },
      estimatedDuration: 0
    }
  ]
};

// 周末健身计划 - 专为只有周末时间的用户设计
export const weekendWeeklyPlan: WeeklyPlan = {
  id: 'weekend-plan',
  name: '周末健身计划',
  description: '专为工作日繁忙的打工人设计，只需周末2天训练，高效全面',
  frequency: '每周训练2天（周六、周日），工作日休息',
  days: [
    {
      id: 'monday',
      name: '周一：全身拉伸恢复',
      type: 'rest',
      targetMuscles: ['全身'],
      warmup: { duration: 5, activities: ['轻柔关节活动', '深呼吸放松'] },
      exercises: [
        {
          name: '颈部拉伸',
          sets: 1,
          reps: '每个方向30秒',
          description: '缓解颈部紧张',
          tips: ['缓慢转动头部', '避免用力过猛', '感受拉伸感即可'],
          restTime: '10秒'
        },
        {
          name: '肩膀环绕',
          sets: 2,
          reps: '前后各10次',
          description: '放松肩膀肌肉',
          tips: ['动作缓慢有控制', '幅度逐渐增大', '配合深呼吸'],
          restTime: '30秒'
        },
        {
          name: '脊柱扭转',
          sets: 1,
          reps: '左右各30秒',
          description: '增加脊柱灵活性',
          tips: ['坐姿或站姿均可', '保持骨盆稳定', '感受脊柱的拉伸'],
          restTime: '15秒'
        },
        {
          name: '腿部拉伸',
          sets: 1,
          reps: '每条腿30秒',
          description: '放松腿部肌肉',
          tips: ['包括大腿前后侧', '小腿拉伸', '保持呼吸顺畅'],
          restTime: '15秒'
        }
      ],
      cooldown: { duration: 5, stretches: ['全身放松', '冥想呼吸3分钟'] },
      estimatedDuration: 25
    },
    {
      id: 'tuesday',
      name: '周二：轻度瑜伽练习',
      type: 'rest',
      targetMuscles: ['核心', '全身'],
      warmup: { duration: 5, activities: ['深呼吸', '简单关节活动'] },
      exercises: [
        {
          name: '猫牛式',
          sets: 2,
          reps: '10次',
          description: '脊柱灵活性练习',
          tips: ['四肢着地', '配合呼吸', '动作缓慢流畅'],
          restTime: '30秒'
        },
        {
          name: '下犬式',
          sets: 2,
          reps: '保持30秒',
          description: '全身拉伸',
          tips: ['手掌贴地', '脚跟尽量着地', '背部伸直'],
          restTime: '30秒'
        },
        {
          name: '婴儿式',
          sets: 1,
          reps: '保持60秒',
          description: '放松恢复姿势',
          tips: ['跪坐', '前额贴地', '完全放松'],
          restTime: '0秒'
        },
        {
          name: '简易扭转',
          sets: 1,
          reps: '左右各30秒',
          description: '脊柱扭转放松',
          tips: ['坐姿扭转', '保持呼吸', '感受脊柱拉伸'],
          restTime: '15秒'
        }
      ],
      cooldown: { duration: 5, stretches: ['仰卧放松', '腹式呼吸'] },
      estimatedDuration: 20
    },
    {
      id: 'wednesday',
      name: '周三：休息日',
      type: 'rest',
      targetMuscles: [],
      warmup: { duration: 0, activities: [] },
      exercises: [],
      cooldown: { duration: 0, stretches: [] },
      estimatedDuration: 0
    },
    {
      id: 'thursday',
      name: '周四：上肢放松+肩颈护理',
      type: 'rest',
      targetMuscles: ['上肢', '肩颈'],
      warmup: { duration: 3, activities: ['肩膀轻柔转动', '颈部活动'] },
      exercises: [
        {
          name: '肩胛骨挤压',
          sets: 2,
          reps: '15次',
          description: '改善圆肩驼背',
          tips: ['坐立或站立', '肩胛骨向后挤压', '保持2秒'],
          restTime: '30秒'
        },
        {
          name: '颈部侧拉',
          sets: 1,
          reps: '每侧30秒',
          description: '缓解颈部紧张',
          tips: ['头部轻柔侧倾', '对侧手下压', '感受拉伸'],
          restTime: '15秒'
        },
        {
          name: '手臂环绕',
          sets: 2,
          reps: '前后各10次',
          description: '肩关节活动',
          tips: ['双臂伸直', '画大圆圈', '动作缓慢'],
          restTime: '30秒'
        },
        {
          name: '胸部拉伸',
          sets: 1,
          reps: '保持45秒',
          description: '开胸拉伸',
          tips: ['双手背后交握', '挺胸抬头', '感受胸部拉伸'],
          restTime: '15秒'
        },
        {
          name: '上背部拉伸',
          sets: 1,
          reps: '保持30秒',
          description: '放松上背部',
          tips: ['双手前伸抱球状', '低头含胸', '感受上背拉伸'],
          restTime: '0秒'
        }
      ],
      cooldown: { duration: 5, stretches: ['肩颈放松按摩', '深呼吸'] },
      estimatedDuration: 20
    },
    {
      id: 'friday',
      name: '周五：下肢恢复+周末准备',
      type: 'rest',
      targetMuscles: ['下肢', '臀部'],
      warmup: { duration: 5, activities: ['轻松踏步', '腿部轻柔摆动'] },
      exercises: [
        {
          name: '大腿前侧拉伸',
          sets: 1,
          reps: '每腿30秒',
          description: '股四头肌拉伸',
          tips: ['站立后拉脚踝', '保持平衡', '感受大腿前侧拉伸'],
          restTime: '15秒'
        },
        {
          name: '大腿后侧拉伸',
          sets: 1,
          reps: '每腿30秒',
          description: '腘绳肌拉伸',
          tips: ['坐姿或站姿', '腿伸直', '身体前倾'],
          restTime: '15秒'
        },
        {
          name: '臀部拉伸',
          sets: 1,
          reps: '每侧30秒',
          description: '臀肌放松',
          tips: ['坐姿翘腿', '身体前倾', '感受臀部拉伸'],
          restTime: '15秒'
        },
        {
          name: '小腿拉伸',
          sets: 1,
          reps: '每腿30秒',
          description: '小腿肌肉放松',
          tips: ['弓步拉伸', '后腿伸直', '脚跟着地'],
          restTime: '15秒'
        },
        {
          name: '轻度深蹲',
          sets: 2,
          reps: '10次',
          description: '激活下肢准备周末训练',
          tips: ['动作缓慢', '幅度适中', '为周末训练做准备'],
          restTime: '45秒'
        }
      ],
      cooldown: { duration: 5, stretches: ['全身放松拉伸', '为周末训练做心理准备'] },
      estimatedDuration: 25
    },
    {
      id: 'saturday',
      name: '周六：全身综合训练',
      type: 'workout',
      targetMuscles: ['全身', '上肢', '下肢', '核心'],
      warmup: {
        duration: 15,
        activities: ['轻松慢跑5分钟', '动态拉伸5分钟', '关节活动5分钟']
      },
      exercises: [
        {
          name: '杠铃深蹲',
          sets: 4,
          reps: '10-12次',
          description: '下肢主要训练动作',
          tips: ['膝盖与脚尖同向', '下蹲至大腿平行地面', '核心收紧'],
          restTime: '120秒'
        },
        {
          name: '杠铃卧推',
          sets: 4,
          reps: '10-12次',
          description: '上肢推力训练',
          tips: ['保持肩胛骨收紧', '下降时控制速度', '推起时呼气'],
          restTime: '120秒'
        },
        {
          name: '引体向上/高位下拉',
          sets: 4,
          reps: '8-12次',
          description: '上肢拉力训练',
          tips: ['肩胛骨下沉', '胸部挺起', '感受背部发力'],
          restTime: '120秒'
        },
        {
          name: '硬拉',
          sets: 3,
          reps: '8-10次',
          description: '后链肌群训练',
          tips: ['保持背部挺直', '杠铃贴近身体', '臀部主导发力'],
          restTime: '120秒'
        },
        {
          name: '坐姿肩推',
          sets: 3,
          reps: '10-12次',
          description: '肩膀训练',
          tips: ['背部贴紧椅背', '推起时不要完全锁死肘关节'],
          restTime: '90秒'
        },
        {
          name: '平板支撑',
          sets: 3,
          reps: '45-60秒',
          description: '核心稳定性训练',
          tips: ['保持身体一条直线', '不要塌腰', '正常呼吸'],
          restTime: '60秒'
        },
        {
          name: '绳索下压',
          sets: 3,
          reps: '12次',
          description: '三头肌训练',
          tips: ['肘关节固定', '只有前臂移动'],
          restTime: '60秒'
        }
      ],
      cooldown: {
        duration: 15,
        stretches: ['全身拉伸30秒×各部位', '重点拉伸训练过的肌群']
      },
      estimatedDuration: 120
    },
    {
      id: 'sunday',
      name: '周日：HIIT+有氧训练',
      type: 'workout',
      targetMuscles: ['心肺', '全身', '核心'],
      warmup: {
        duration: 10,
        activities: ['轻松慢跑5分钟', '动态拉伸', '关节活动']
      },
      exercises: [
        {
          name: 'HIIT循环训练',
          sets: 6,
          reps: '45秒高强度+15秒休息',
          description: '高强度间歇训练',
          tips: ['第1轮：波比跳', '第2轮：深蹲跳', '第3轮：登山跑', '第4轮：开合跳', '第5轮：俯卧撑', '第6轮：高抬腿'],
          restTime: '15秒'
        },
        {
          name: '组间休息',
          sets: 1,
          reps: '2分钟',
          description: '充分恢复准备下一轮',
          tips: ['深呼吸', '轻松走动', '补充水分'],
          restTime: '120秒'
        },
        {
          name: 'HIIT循环训练（第二轮）',
          sets: 6,
          reps: '45秒高强度+15秒休息',
          description: '重复高强度间歇训练',
          tips: ['保持动作质量', '根据体能调整强度', '坚持完成'],
          restTime: '15秒'
        },
        {
          name: '中等强度有氧',
          sets: 1,
          reps: '20分钟',
          description: '恢复性有氧运动',
          tips: ['跑步机或椭圆机', '心率控制在70-80%最大心率', '保持稳定节奏'],
          restTime: '0秒'
        },
        {
          name: '核心强化',
          sets: 3,
          reps: '各15次',
          description: '腹部核心训练',
          tips: ['卷腹15次', '俄罗斯转体15次', '反向卷腹15次'],
          restTime: '30秒'
        }
      ],
      cooldown: {
        duration: 15,
        stretches: ['全身放松拉伸', '重点拉伸腿部和核心', '深呼吸放松']
      },
      estimatedDuration: 90
    }
  ],
  totalDays: 7
};

// 训练强度等级
export const intensityLevels = {
  beginner: {
    name: '初级',
    description: '适合健身新手，注重动作学习和基础体能建立',
    restTime: '长休息时间（90-120秒）',
    sets: '较少组数（2-3组）',
    reps: '中等次数（10-15次）'
  },
  intermediate: {
    name: '中级',
    description: '有一定健身基础，可以承受中等强度训练',
    restTime: '中等休息时间（60-90秒）',
    sets: '标准组数（3-4组）',
    reps: '目标导向次数（8-12次增肌，12-15次塑形）'
  },
  advanced: {
    name: '高级',
    description: '健身经验丰富，可以承受高强度训练',
    restTime: '较短休息时间（45-60秒）',
    sets: '较多组数（4-5组）',
    reps: '高强度次数（6-8次力量，15+次耐力）'
  }
};

// 训练目标
export const trainingGoals = {
  muscle_gain: {
    name: '增肌',
    description: '增加肌肉量，提高力量',
    repRange: '6-10次',
    restTime: '90-120秒',
    frequency: '每周4-5次'
  },
  fat_loss: {
    name: '减脂',
    description: '减少体脂，塑造身形',
    repRange: '12-15次',
    restTime: '45-60秒',
    frequency: '每周5-6次'
  },
  strength: {
    name: '力量',
    description: '提高最大力量',
    repRange: '3-6次',
    restTime: '2-3分钟',
    frequency: '每周3-4次'
  },
  endurance: {
    name: '耐力',
    description: '提高肌肉耐力和心肺功能',
    repRange: '15-20次',
    restTime: '30-45秒',
    frequency: '每周5-6次'
  }
};