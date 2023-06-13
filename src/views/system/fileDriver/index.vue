<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="驱动名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入驱动名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="驱动类型" prop="driver">
        <el-select v-model="queryParams.driver" placeholder="请选择驱动类型" clearable>
          <el-option
            v-for="dict in dict.type.sys_file_driver"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
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
          @click="handleAdd"
          v-hasPermi="['system:fileDriver:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:fileDriver:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:fileDriver:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="fileDriverList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="驱动名称" align="center" prop="name" />
      <el-table-column label="驱动类型" align="center" prop="driver">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_file_driver" :value="scope.row.driver"/>
        </template>
      </el-table-column>
      <el-table-column label="默认驱动" align="center" prop="master" >
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_file_driver_master" :value="scope.row.master"/>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
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
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:fileDriver:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-attract"
            @click="handleMaster(scope.row)"
            v-hasPermi="['system:fileDriver:master']"
          >主配置</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-share"
            @click="handleTest(scope.row)"
            v-hasPermi="['system:fileDriver:test']"
          >测试</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:fileDriver:remove']"
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

    <!-- 添加或修改驱动配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="驱动名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入驱动名称" />
        </el-form-item>
        <el-form-item label="驱动类型" prop="driver">
          <el-select v-model="form.driver" placeholder="请选择驱动类型" @change="onChangeDriver">
            <el-option
              v-for="dict in dict.type.sys_file_driver"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- 百度云存储 -->
        <div v-if="form.driver==='bos'">
          <el-form-item label="accessKey">
            <el-input v-model="form.config.accessKey" placeholder="请输入accessKey" />
          </el-form-item>
          <el-form-item label="secretKey">
            <el-input v-model="form.config.secretKey" placeholder="请输入secretKey" />
          </el-form-item>
          <el-form-item label="endpoint">
            <el-input v-model="form.config.endpoint" placeholder="请输入endpoint" />
          </el-form-item>
          <el-form-item label="bucket">
            <el-input v-model="form.config.bucket" placeholder="请输入bucket" />
          </el-form-item>
          <el-form-item label="domain">
            <el-input v-model="form.config.domain" placeholder="请输入domain" />
          </el-form-item>
          <el-form-item label="expire">
            <el-input v-model="form.config.expire" placeholder="请输入expire" />
          </el-form-item>
        </div>
        <!-- 腾讯云存储 -->
        <div v-if="form.driver==='cos'">
          <el-form-item label="accessKey">
            <el-input v-model="form.config.accessKey" placeholder="请输入accessKey" />
          </el-form-item>
          <el-form-item label="secretKey">
            <el-input v-model="form.config.secretKey" placeholder="请输入secretKey" />
          </el-form-item>
          <el-form-item label="appId">
            <el-input v-model="form.config.appId" placeholder="请输入appId" />
          </el-form-item>
          <el-form-item label="region">
            <el-input v-model="form.config.region" placeholder="请输入region" />
          </el-form-item>
          <el-form-item label="bucket">
            <el-input v-model="form.config.bucket" placeholder="请输入bucket" />
          </el-form-item>
          <el-form-item label="domain">
            <el-input v-model="form.config.domain" placeholder="请输入domain" />
          </el-form-item>
          <el-form-item label="expire">
            <el-input v-model="form.config.expire" placeholder="请输入expire" />
          </el-form-item>
        </div>
        <!-- 本地磁盘 -->
        <div v-if="form.driver==='local'">
          <el-form-item label="path">
            <el-input v-model="form.config.path" placeholder="请输入path" />
          </el-form-item>
          <el-form-item label="开发模式">
            <el-radio-group v-model="form.config.isDev">
              <el-radio label="0">否</el-radio>
              <el-radio label="1">是</el-radio>
            </el-radio-group>
            <br>开发模式不需要设置domain，可以直接本地访问
          </el-form-item>
          <el-form-item label="domain">
            <el-input v-model="form.config.domain" placeholder="请输入domain" />
            需要将domain指定path目录
          </el-form-item>
        </div>
        <!-- minio存储 -->
        <div v-if="form.driver==='minio'">
          <el-form-item label="accessKey">
            <el-input v-model="form.config.accessKey" placeholder="请输入accessKey" />
          </el-form-item>
          <el-form-item label="secretKey">
            <el-input v-model="form.config.secretKey" placeholder="请输入secretKey" />
          </el-form-item>
          <el-form-item label="endpoint">
            <el-input v-model="form.config.endpoint" placeholder="请输入endpoint" />
          </el-form-item>
          <el-form-item label="bucket">
            <el-input v-model="form.config.bucket" placeholder="请输入bucket" />
          </el-form-item>
          <el-form-item label="domain">
            <el-input v-model="form.config.domain" placeholder="请输入domain" />
          </el-form-item>
          <el-form-item label="expire">
            <el-input v-model="form.config.expire" placeholder="请输入expire" />
          </el-form-item>
        </div>
        <!-- 华为云存储 -->
        <div v-if="form.driver==='obs'">
          <el-form-item label="accessKey">
            <el-input v-model="form.config.accessKey" placeholder="请输入accessKey" />
          </el-form-item>
          <el-form-item label="secretKey">
            <el-input v-model="form.config.secretKey" placeholder="请输入secretKey" />
          </el-form-item>
          <el-form-item label="endpoint">
            <el-input v-model="form.config.endpoint" placeholder="请输入endpoint" />
          </el-form-item>
          <el-form-item label="bucket">
            <el-input v-model="form.config.bucket" placeholder="请输入bucket" />
          </el-form-item>
          <el-form-item label="domain">
            <el-input v-model="form.config.domain" placeholder="请输入domain" />
          </el-form-item>
          <el-form-item label="expire">
            <el-input v-model="form.config.expire" placeholder="请输入expire" />
          </el-form-item>
        </div>
        <!-- 阿里云存储 -->
        <div v-if="form.driver==='oss'">
          <el-form-item label="accessKey">
            <el-input v-model="form.config.accessKey" placeholder="请输入accessKey" />
          </el-form-item>
          <el-form-item label="secretKey">
            <el-input v-model="form.config.secretKey" placeholder="请输入secretKey" />
          </el-form-item>
          <el-form-item label="endpoint">
            <el-input v-model="form.config.endpoint" placeholder="请输入endpoint" />
          </el-form-item>
          <el-form-item label="bucket">
            <el-input v-model="form.config.bucket" placeholder="请输入bucket" />
          </el-form-item>
          <el-form-item label="domain">
            <el-input v-model="form.config.domain" placeholder="请输入domain" />
          </el-form-item>
          <el-form-item label="expire">
            <el-input v-model="form.config.expire" placeholder="请输入expire" />
          </el-form-item>
        </div>
        <!-- 七牛云储存 -->
        <div v-if="form.driver==='qiniu'">
          <el-form-item label="accessKey">
            <el-input v-model="form.config.accessKey" placeholder="请输入accessKey" />
          </el-form-item>
          <el-form-item label="secretKey">
            <el-input v-model="form.config.secretKey" placeholder="请输入secretKey" />
          </el-form-item>
          <el-form-item label="endpoint">
            <el-input v-model="form.config.endpoint" placeholder="请输入endpoint" />
          </el-form-item>
          <el-form-item label="bucket">
            <el-input v-model="form.config.bucket" placeholder="请输入bucket" />
          </el-form-item>
          <el-form-item label="domain">
            <el-input v-model="form.config.domain" placeholder="请输入domain" />
          </el-form-item>
          <el-form-item label="expire">
            <el-input v-model="form.config.expire" placeholder="请输入expire" />
          </el-form-item>
        </div>
        <!-- 又拍云存储 -->
        <div v-if="form.driver==='upyun'">
          <el-form-item label="bucket">
            <el-input v-model="form.config.bucket" placeholder="请输入bucket" />
          </el-form-item>
          <el-form-item label="operator">
            <el-input v-model="form.config.operator" placeholder="请输入operator" />
          </el-form-item>
          <el-form-item label="password">
            <el-input v-model="form.config.password" placeholder="请输入password" />
          </el-form-item>
          <el-form-item label="secret">
            <el-input v-model="form.config.secret" placeholder="请输入secret" />
          </el-form-item>
          <el-form-item label="domain">
            <el-input v-model="form.config.domain" placeholder="请输入domain" />
          </el-form-item>
          <el-form-item label="expire">
            <el-input v-model="form.config.expire" placeholder="请输入expire" />
          </el-form-item>
        </div>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listFileDriver,
  getFileDriver,
  delFileDriver,
  addFileDriver,
  updateFileDriver,
  testFileDriver,
  setMasterFileDriver
} from "@/api/system/fileDriver";

export default {
  name: "FileDriver",
  dicts: ['sys_file_driver','sys_file_driver_master'],
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
      // 日期范围
      dateRange: [],
      // 驱动配置表格数据
      fileDriverList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        driver: null,
      },
      // 表单参数
      form: {
        config:{}
      },
      // 表单校验
      rules: {
        name: [
          { required: true, message: "驱动名称不能为空", trigger: "blur" }
        ],
        driver: [
          { required: true, message: "驱动类型不能为空", trigger: "change" }
        ],
        master: [
          { required: true, message: "默认驱动不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询驱动配置列表 */
    getList() {
      this.loading = true;
      listFileDriver(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.fileDriverList = response.data.list;
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
        name: null,
        driver: null,
        remark: null,
        master: null,
        config: {},
      };
      this.resetForm("form");
    },
    onChangeDriver(value){
      if (value === 'local') {
        console.log(value)
        this.form.config.isDev = '1'
      }
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
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加驱动配置";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getFileDriver(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改驱动配置";
      });
    },
    /** 设置默认按钮操作 */
    handleMaster(row) {
      this.$confirm('是否确认将['+row.name+']设置为默认驱动?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function() {
        return setMasterFileDriver(row.id);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("设置成功");
      })
    },
    /** 测试按钮操作 */
    handleTest(row) {
      testFileDriver(row.id).then((response) => {
        this.$modal.msgSuccess("测试通过，上传文件成功！");
      }).catch(() => {});
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateFileDriver(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addFileDriver(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = (row.id && [row.id]) || this.ids;
      this.$confirm('是否确认删除驱动配置编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delFileDriver({ids:ids});
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
    },
  }
};
</script>
