<template>
  <!-- 授权API -->
  <el-dialog title="选择API" :visible.sync="visible" width="800px" top="5vh" append-to-body>
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
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="apiList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="接口名称" align="left" width="250" prop="apiName" >
          <template slot-scope="scope">
            <el-tag type="success">{{ scope.row.apiModule }}</el-tag>{{ scope.row.apiName }}
          </template>
        </el-table-column>
        <el-table-column label="接口地址" align="left" prop="apiUrl">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.apiMethod==='GET'">GET</el-tag>
            <el-tag v-if="scope.row.apiMethod==='POST'">POST</el-tag>
            <el-tag type="warning" v-if="scope.row.apiMethod==='PUT'">PUT</el-tag>
            <el-tag type="danger" v-if="scope.row.apiMethod==='DELETE'">DELETE</el-tag>
            {{ scope.row.apiUrl }}
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
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="handleAuthApi">确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { listApi, listApiModule } from "@/api/system/api";

export default {
  name: "AuthApi",
  data() {
    return {
      // 是否显示
      visible: false,
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
      }
    };
  },
  created() {
    this.getModuleList();
    this.getList();
  },
  inject:['bindApis'],
  methods: {
    show() {
      this.getList();
      this.visible = true;
    },
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
        response.data.forEach(element => {
          this.moduleList.push({label:element,value:element})
        });
        this.loading = false;
      });
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
    handleAuthApi(){
      if (this.ids?.length <= 0) {
        this.$modal.msgError("请选择需要授权的API");
        return
      }
      let idMap = {}
      this.ids.forEach(id => {
        idMap[id] = id
      });

      let apis = []
      this.apiList.forEach(item => {
        if (idMap.hasOwnProperty(item.apiId)){
          apis.push(item)
        }
      });
      this.bindApis(apis)
      this.visible = false;
    },
  }
};
</script>