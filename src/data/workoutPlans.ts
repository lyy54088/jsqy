// 训练计划配置
export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  description?: string;
  tips?: string[];
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
  frequency: string; // 例如："每周4-5天训练"
  days: WorkoutDay[];
}

// 默认训练计划
export const defaultWeeklyPlan: WeeklyPlan = {
  id: 'default-plan',
  name: '标准健身计划',
  description: '适合初中级健身者的全面训练计划，每周4-5天训练，2-3天休息',
  frequency: '每周训练4-5天，留2-3天休息',
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
          tips: ['保持肩胛骨收紧', '下降时控制速度', '推起时呼气']
        },
        {
          name: '上斜哑铃卧推',
          sets: 3,
          reps: '10-12次',
          description: '针对胸肌上部',
          tips: ['角度控制在30-45度', '哑铃轨迹呈弧形']
        },
        {
          name: '坐姿肩推',
          sets: 3,
          reps: '10次',
          description: '肩膀主要训练动作',
          tips: ['背部贴紧椅背', '推起时不要完全锁死肘关节']
        },
        {
          name: '侧平举',
          sets: 3,
          reps: '12-15次',
          description: '肩膀中束训练',
          tips: ['控制重量', '动作要慢', '顶峰收缩1秒']
        },
        {
          name: '绳索下压（三头肌）',
          sets: 3,
          reps: '12次',
          description: '三头肌孤立训练',
          tips: ['肘关节固定', '只有前臂移动']
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
          tips: ['膝盖与脚尖同向', '下蹲至大腿平行地面', '核心收紧']
        },
        {
          name: '硬拉',
          sets: 3,
          reps: '6-8次（增肌）/10次（塑形）',
          description: '后链肌群训练',
          tips: ['保持背部挺直', '杠铃贴近身体', '臀部主导发力']
        },
        {
          name: '腿举',
          sets: 3,
          reps: '12-15次',
          description: '安全的腿部训练',
          tips: ['脚掌位置适中', '下降时控制速度']
        },
        {
          name: '箭步蹲',
          sets: 3,
          reps: '每侧10次',
          description: '单腿训练，改善不平衡',
          tips: ['前腿承重', '后腿轻触地面', '保持躯干直立']
        },
        {
          name: '臀桥（负重）',
          sets: 3,
          reps: '15-20次',
          description: '臀部激活训练',
          tips: ['顶峰收缩臀部', '避免腰部代偿']
        },
        {
          name: '小腿提踵',
          sets: 4,
          reps: '20-30次',
          description: '小腿肌群训练',
          tips: ['全程控制', '顶峰停留1秒']
        }
      ],
      cooldown: {
        duration: 8,
        stretches: ['大腿前侧拉伸30秒', '大腿后侧拉伸30秒', '臀部拉伸30秒', '小腿拉伸30秒']
      },
      estimatedDuration: 75
    },
    {
      id: 'wednesday',
      name: '周三：休息/主动恢复',
      type: 'active_recovery',
      targetMuscles: [],
      warmup: {
        duration: 5,
        activities: ['轻松活动关节']
      },
      exercises: [
        {
          name: '低强度有氧',
          sets: 1,
          reps: '30-60分钟',
          description: '促进恢复的轻松活动',
          tips: ['选择散步、瑜伽、泡沫轴放松或游泳', '强度要低', '重点是促进血液循环']
        }
      ],
      cooldown: {
        duration: 10,
        stretches: ['全身放松拉伸']
      },
      estimatedDuration: 45
    },
    {
      id: 'thursday',
      name: '周四：上肢拉力',
      type: 'workout',
      targetMuscles: ['背部', '二头肌'],
      warmup: {
        duration: 10,
        activities: ['划船动作轻量预演', '肩部环绕']
      },
      exercises: [
        {
          name: '引体向上',
          sets: 4,
          reps: '力竭',
          description: '背部王牌动作',
          tips: ['可使用辅助带', '下降时控制速度', '充分拉伸背阔肌']
        },
        {
          name: '高位下拉',
          sets: 3,
          reps: '10-12次',
          description: '背部宽度训练',
          tips: ['身体略微后倾', '拉至胸前', '肩胛骨主动收缩']
        },
        {
          name: '坐姿划船',
          sets: 3,
          reps: '10次',
          description: '背部厚度训练',
          tips: ['挺胸收腹', '肘关节贴近身体', '顶峰收缩背部']
        },
        {
          name: '单臂哑铃划船',
          sets: 3,
          reps: '每侧12次',
          description: '单侧背部训练',
          tips: ['支撑腿稳定', '哑铃拉至腰部', '感受背部发力']
        },
        {
          name: '杠铃弯举',
          sets: 3,
          reps: '10次',
          description: '二头肌主要训练',
          tips: ['肘关节固定', '避免身体摆动', '顶峰收缩']
        },
        {
          name: '锤式弯举',
          sets: 3,
          reps: '12次',
          description: '二头肌外侧训练',
          tips: ['哑铃保持中性握法', '动作要慢']
        }
      ],
      cooldown: {
        duration: 5,
        stretches: ['背部拉伸30秒', '二头肌拉伸30秒', '前臂拉伸30秒']
      },
      estimatedDuration: 65
    },
    {
      id: 'friday',
      name: '周五：核心+全身塑形',
      type: 'workout',
      targetMuscles: ['核心', '全身'],
      warmup: {
        duration: 5,
        activities: ['动态拉伸', '转体', '猫牛式']
      },
      exercises: [
        {
          name: '平板支撑',
          sets: 4,
          reps: '60秒',
          description: '核心稳定性训练',
          tips: ['身体呈一条直线', '避免塌腰', '正常呼吸']
        },
        {
          name: '卷腹',
          sets: 3,
          reps: '20次',
          description: '腹直肌训练',
          tips: ['下背部贴地', '用腹部发力', '避免颈部用力']
        },
        {
          name: '俄罗斯转体',
          sets: 3,
          reps: '每侧15次',
          description: '腹斜肌训练',
          tips: ['保持平衡', '转体幅度要大', '可负重增加难度']
        },
        {
          name: '悬挂举腿',
          sets: 3,
          reps: '12次',
          description: '下腹部训练',
          tips: ['避免摆动', '腿部抬至90度', '控制下降速度']
        },
        {
          name: '波比跳',
          sets: 3,
          reps: '10-15次',
          description: '全身燃脂训练',
          tips: ['动作要标准', '保持节奏', '根据体能调整次数']
        },
        {
          name: '壶铃摇摆',
          sets: 3,
          reps: '15次',
          description: '全身爆发力训练',
          tips: ['臀部主导发力', '壶铃摆至胸前', '核心收紧']
        }
      ],
      cooldown: {
        duration: 8,
        stretches: ['核心肌群拉伸30秒', '腰腹两侧拉伸30秒']
      },
      estimatedDuration: 50
    },
    {
      id: 'saturday',
      name: '周六：HIIT/有氧',
      type: 'workout',
      targetMuscles: ['心肺', '全身'],
      warmup: {
        duration: 5,
        activities: ['轻松慢跑', '动态拉伸']
      },
      exercises: [
        {
          name: 'HIIT训练（减脂）',
          sets: 8,
          reps: '30秒高强度+30秒休息',
          description: '高强度间歇训练',
          tips: ['跳绳30秒+深蹲跳30秒+登山跑30秒+休息30秒', '循环8-10组', '根据体能调整']
        },
        {
          name: '低强度有氧（增肌）',
          sets: 1,
          reps: '40分钟',
          description: '增肌期有氧选择',
          tips: ['慢跑或椭圆机', '心率控制在60-70%最大心率', '避免过度消耗']
        }
      ],
      cooldown: {
        duration: 10,
        stretches: ['全身拉伸放松']
      },
      estimatedDuration: 40
    },
    {
      id: 'sunday',
      name: '周日：完全休息',
      type: 'rest',
      targetMuscles: [],
      warmup: {
        duration: 0,
        activities: []
      },
      exercises: [
        {
          name: '完全休息',
          sets: 1,
          reps: '全天',
          description: '身体恢复日',
          tips: ['保证充足睡眠', '让身体彻底恢复', '为下周训练储备能量', '可以进行轻松的日常活动']
        }
      ],
      cooldown: {
        duration: 0,
        stretches: []
      },
      estimatedDuration: 0
    }
  ]
};

// 训练强度等级
export const intensityLevels = {
  beginner: {
    name: '初级',
    description: '适合刚开始健身的人群',
    modifications: {
      setsMultiplier: 0.8,
      repsMultiplier: 0.8,
      restTime: '90-120秒'
    }
  },
  intermediate: {
    name: '中级',
    description: '有一定健身基础的人群',
    modifications: {
      setsMultiplier: 1.0,
      repsMultiplier: 1.0,
      restTime: '60-90秒'
    }
  },
  advanced: {
    name: '高级',
    description: '有丰富健身经验的人群',
    modifications: {
      setsMultiplier: 1.2,
      repsMultiplier: 1.2,
      restTime: '45-60秒'
    }
  }
};

// 训练目标
export const trainingGoals = {
  muscle_gain: {
    name: '增肌',
    description: '主要目标是增加肌肉量',
    recommendations: {
      reps: '6-12次',
      sets: '3-5组',
      rest: '60-90秒',
      frequency: '每周4-5次'
    }
  },
  fat_loss: {
    name: '减脂',
    description: '主要目标是减少体脂率',
    recommendations: {
      reps: '12-20次',
      sets: '3-4组',
      rest: '30-60秒',
      frequency: '每周5-6次'
    }
  },
  strength: {
    name: '力量',
    description: '主要目标是提高最大力量',
    recommendations: {
      reps: '1-6次',
      sets: '3-6组',
      rest: '2-5分钟',
      frequency: '每周3-4次'
    }
  },
  endurance: {
    name: '耐力',
    description: '主要目标是提高肌肉耐力',
    recommendations: {
      reps: '15-25次',
      sets: '2-3组',
      rest: '30-45秒',
      frequency: '每周4-6次'
    }
  }
};