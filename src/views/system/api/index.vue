<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="接口名称" prop="apiName">
        <el-input
          v-model="queryParams.apiName"
          placeholder="请输入接口名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="业务模块" prop="apiModule">
        <el-select v-model="queryParams.apiModule" clearable placeholder="请选择模块" filterable>
          <el-option
            v-for="item in moduleList"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="请求方法" prop="apiMethod">
        <el-select v-model="queryParams.apiMethod" clearable placeholder="请选择请求方法" filterable>
          <el-option
            v-for="item in methodOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="接口地址" prop="apiUrl">
        <el-input
          v-model="queryParams.apiUrl"
          placeholder="请输入接口地址"
          clearable
          @keyup.enter.native="handleQuery"
        />
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
          v-hasPermi="['system:api:add']"
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
          v-hasPermi="['system:api:edit']"
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
          v-hasPermi="['system:api:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleReimport"
          v-hasPermi="['system:api:reimport']"
        >重新导入全部API</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="apiList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" align="center">
        <template slot-scope="scope">
          <span>{{(queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1}}</span>
        </template>
      </el-table-column>
      <el-table-column label="接口名称" align="center" prop="apiName" />
      <el-table-column label="业务模块" align="center" prop="apiModule" />
      <el-table-column label="接口地址" prop="apiUrl" width="350px">
        <template slot-scope="scope">
          <el-tag type="success" v-if="scope.row.apiMethod==='GET'">GET</el-tag>
          <el-tag v-if="scope.row.apiMethod==='POST'">POST</el-tag>
          <el-tag type="warning" v-if="scope.row.apiMethod==='PUT'">PUT</el-tag>
          <el-tag type="danger" v-if="scope.row.apiMethod==='DELETE'">DELETE</el-tag>
          {{ scope.row.apiUrl }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createdAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:api:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:api:remove']"
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

    <!-- 添加或修改接口管理对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="接口名称" prop="apiName">
          <el-input v-model="form.apiName" placeholder="请输入接口名称" />
        </el-form-item>
        <el-form-item label="业务模块" prop="apiModule">
          <el-select v-model="form.apiModule" clearable placeholder="请选择模块" filterable>
            <el-option
              v-for="item in moduleList"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="请求方法" prop="apiMethod">
          <el-select v-model="form.apiMethod" clearable placeholder="请选择请求方法">
            <el-option
              v-for="item in methodOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="接口地址" prop="apiUrl">
          <el-input v-model="form.apiUrl" placeholder="请输入接口地址" />
        </el-form-item>
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
import { listApi, listApiModule, getApi, delApi, addApi, updateApi, reimportApi } from "@/api/system/api";

export default {
  name: "Api",
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
      // 接口管理表格数据
      apiList: [],
      // 接口模块
      moduleList: [],
      methodOptions: [
        {lable:"GET",value:"GET"},
        {lable:"POST",value:"POST"},
        {lable:"PUT",value:"PUT"},
        {lable:"DELETE",value:"DELETE"},
      ],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        apiName: null,
        apiModule: null,
        apiUrl: null,
        apiMethod: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        apiName: [
          { required: true, message: "接口名称不能为空", trigger: "blur" }
        ],
        apiUrl: [
          { required: true, message: "接口地址不能为空", trigger: "blur" }
        ],
        apiMethod: [
          { required: true, message: "请求方法不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getModuleList();
    this.getList();
  },
  methods: {
    /** 查询接口管理列表 */
    getList() {
      this.loading = true;
      listApi(this.queryParams).then(response => {
        this.apiList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    /** 查询接口管理列表 */
    getModuleList() {
      this.loading = true;
      listApiModule().then(response => {
        this.moduleList = []
        response.data?.forEach(element => {
          this.moduleList.push({label:element,value:element})
        });
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
        apiName: null,
        apiModule: null,
        apiUrl: null,
        apiMethod: null,
        remark: null
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
      this.ids = selection.map(item => item.apiId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加接口管理";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const apiId = row.apiId || this.ids
      getApi(apiId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改接口管理";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.apiId != null) {
            updateApi(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addApi(this.form).then(response => {
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
      const apiIds = (row.apiId && [row.apiId]) || this.ids;
      this.$confirm('是否确认删除接口管理编号为"' + apiIds + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delApi({apiIds:apiIds});
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
    },

    /** 导入按钮操作 */
    handleReimport() {
      reimportApi(this.form).then(response => {
        this.$modal.msgSuccess("重新导入成功");
        this.getList();
      });
    }
  }
};
</script>