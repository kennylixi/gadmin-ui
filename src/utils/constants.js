/**
 * Created by 芋道源码
 *
 * 枚举类
 */
import {beginOfDay, endOfDay} from "@/utils/dateUtils";

export const datePickerOptions = {
  shortcuts: [{
    text: '最近一周',
    onClick(picker) {
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      const end = new Date();
      picker.$emit('pick', [beginOfDay(start), endOfDay(end)]);
    }
  }, {
    text: '最近一个月',
    onClick(picker) {
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      const end = new Date();
      picker.$emit('pick', [beginOfDay(start), endOfDay(end)]);
    }
  }, {
    text: '最近三个月',
    onClick(picker) {
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      const end = new Date();
      picker.$emit('pick', [beginOfDay(start), endOfDay(end)]);
    }
  }]
}
