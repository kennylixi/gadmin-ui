<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="文件名称" prop="fileName">
        <el-input
          v-model="queryParams.fileName"
          placeholder="请输入文件名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="备份时间">
        <el-date-picker
          v-model="dateRange"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleBackups"
          v-hasPermi="['system:sqlBackups:backups']"
        >备份</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:sqlBackups:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="sqlBackupsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="备份ID" align="center" prop="backupsId" />
      <el-table-column label="文件名称" align="center" prop="fileName" />
      <el-table-column label="文件大小" align="center" prop="fileSize" >
        <template slot-scope="scope">
          <span>{{ (scope.row.fileSize / 1024).toFixed(2) }}kb</span>
        </template>
      </el-table-column>
      <el-table-column label="备份时间" align="center" prop="createdAt" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createdAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleRecover(scope.row)"
            v-hasPermi="['system:sqlBackups:recover']"
          >恢复</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handlePwd(scope.row)"
            v-hasPermi="['system:sqlBackups:pwd']"
          >获取密码</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:sqlBackups:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { listSqlBackups, recover, delSqlBackups, backups, getPwd } from "@/api/system/sqlBackups";

export default {
  name: "SqlBackups",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 数据库备份表表格数据
      sqlBackupsList: [],
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        fileName: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询数据库备份表列表 */
    getList() {
      this.loading = true;
      listSqlBackups(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.sqlBackupsList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        fileName: null,
        fileSize: null,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.backupsId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 备份按钮操作 */
    handleBackups() {
      this.$confirm('是否确认备份数据库?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return backups();
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess("备份成功");
        })
    },
    /** 恢复按钮操作 */
    handleRecover(row) {
      this.$confirm('是否确认恢复数据库到备份编号"' + row.backupsId + '"?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return recover(row.backupsId);
        }).then(() => {
          this.$modal.msgSuccess("恢复成功");
        })
    },
    /** 获取密码按钮操作 */
    handlePwd(row) {
      getPwd(row.backupsId).then(response => {
        this.$modal.alertSuccess(response.data);
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const backupsIds = (row.backupsId && [row.backupsId]) || this.ids;
      this.$confirm('是否确认删除数据库备份表编号为"' + backupsIds + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delSqlBackups({backupsIds:backupsIds});
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
    },
  }
};
</script>