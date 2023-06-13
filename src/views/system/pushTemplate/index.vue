<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="模板名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入模板名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="模板编码" prop="code">
        <el-input
          v-model="queryParams.code"
          placeholder="请输入模板编码"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="渠道名称" prop="channelId">
        <el-select v-model="queryParams.channelId" placeholder="请选择渠道" filterable clearable>
          <el-option
            v-for="item in pushChannelList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
            <span style="float: left">{{ item.name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.typeName }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="消息类型" prop="msgType">
        <el-select v-model="queryParams.msgType" placeholder="请选择消息类型" clearable>
          <el-option
            v-for="dict in dict.type.sys_push_msg_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
          v-hasPermi="['system:pushTemplate:add']"
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
          v-hasPermi="['system:pushTemplate:edit']"
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
          v-hasPermi="['system:pushTemplate:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:pushTemplate:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="pushTemplateList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="模板编码" align="center" prop="code" />
      <el-table-column label="模板名称" align="center" >
        <template slot-scope="scope">
          {{scope.row.name}}
          <dict-tag :options="dict.type.sys_push_msg_type" :value="scope.row.msgType"/>
        </template>
      </el-table-column>
      <el-table-column label="消息类型" align="center">
        <template slot-scope="scope">
          {{ scope.row.typeName }}
          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.typeStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="渠道信息" align="center">
        <template slot-scope="scope">
          {{ scope.row.channelName }}
          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.channelStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="模板信息" align="left">
        <template slot-scope="scope">
          <span style="float: left" v-for="(value,key) in scope.row.params" :key="key"><span style="color: #1890ff">{{paramFields[key]}}:</span>{{value}}<br></span>
        </template>
      </el-table-column>
      <el-table-column label="立即执行" align="center" prop="cron" >
        <template slot-scope="scope">
          <span v-if="scope.row.cron==0">实时</span>
          <span v-else>{{scope.row.cron}}</span>
        </template>
      </el-table-column>
      <el-table-column label="模板状态" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status"/>
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
            v-hasPermi="['system:pushTemplate:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:pushTemplate:remove']"
          >删除</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-share"
            @click="handleTest(scope.row)"
            v-hasPermi="['system:pushTemplate:test']"
          >测试</el-button>
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

    <!-- 添加或修改消息模板对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="模板名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入模板名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板编码" prop="code">
              <el-input v-model="form.code" placeholder="请输入模板编码" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="渠道名称" prop="channelId">
              <el-select v-model="form.channelId" placeholder="请选择渠道" style="width:230px" filterable clearable @change="onChannelChange">
                <el-option
                  v-for="item in pushChannelList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                  <span style="float: left">{{ item.name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ item.typeName }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板状态">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in dict.type.sys_normal_disable"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="渠道信息" prop="params">
              <el-input v-model="form.params" type="textarea" placeholder="请输入内容" autosize/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="立即执行" prop="cron">
              <el-radio-group v-model="execStatus">
                <el-radio :label="'0'">实时</el-radio>
                <el-radio :label="'1'">定时</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="消息类型" prop="msgType">
              <el-radio-group v-model="form.msgType">
                <el-radio v-for="dict in dict.type.sys_push_msg_type" :key="dict.value" :label="dict.value">{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="cron表达式" prop="cron" v-show="execStatus==='1'">
              <el-input v-model="form.cron" placeholder="需要立即执行时填写0" >
                <template slot="append">
                  <el-button type="primary" @click="handleShowCron">
                    生成表达式
                    <i class="el-icon-time el-icon--right"></i>
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog title="Cron表达式生成器" :visible.sync="openCron" append-to-body destroy-on-close class="scrollbar">
      <crontab @hide="openCron=false" @fill="crontabFill" :expression="expression"></crontab>
    </el-dialog>

    <!-- 测试推送 -->
    <el-dialog title="测试消息推送" :visible.sync="openTest" width="600px" append-to-body>
      <el-form ref="testForm" :model="testForm" label-width="100px">
        <template v-for="(value, key) in testForm.params">
          <el-form-item :label="paramFields[key]">
            <el-input :value="value" disabled/>
          </el-form-item>
        </template>
        <el-form-item label="目标账号" prop="account" :rules="[{ required: true, message: '目标账号不能为空'}]">
          <el-input v-model="testForm.account" placeholder="请输入目标账号"/>
        </el-form-item>
        <template v-for="(value, key) in testForm.templateParams">
          <el-form-item :label="'参数'+key" :rules="[{ required: true, message: '参数'+key+'不能为空'}]">
            <el-input v-model="testForm.templateParams[key]" :placeholder="'请输入 '+key+' 参数'"/>
          </el-form-item>
        </template>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitTestForm">确 定</el-button>
        <el-button @click="cancelTest">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listSimplePushChannel, getPushChannelTemplateParams } from "@/api/system/pushChannel"
import { listPushTemplate, getPushTemplate, delPushTemplate, addPushTemplate, updatePushTemplate, testPushTemplate } from "@/api/system/pushTemplate";
import Crontab from '@/components/Crontab'

export default {
  components: { Crontab },
  name: "PushTemplate",
  dicts: ['sys_push_msg_type','sys_normal_disable'],
  data() {
    return {
      paramFields: {
        "templateId":"模板编号",
        "templateContent":"模板内容",
        "title":"标题",
        "content":"内容",
        "url":"url",
      },
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
      // 消息模板表格数据
      pushTemplateList: [],
      // 渠道列表
      pushChannelList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示Cron表达式弹出层
      openCron: false,
      // 传入的表达式
      expression: "",
      // 是否显示弹出层
      openTest: false,
      // 表单参数
      testForm: {},
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        code: null,
        channelId: null,
        msgType: null,
        status: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "模板名称不能为空", trigger: "blur" }
        ],
        code: [
          { required: true, message: "模板编码不能为空", trigger: "blur" }
        ],
        channelId: [
          { required: true, message: "请选择渠道", trigger: "change" }
        ],
        params: [
          { required: true, message: "渠道信息不能为空", trigger: "blur" }
        ],
        msgType: [
          { required: true, message: "消息类型不能为空", trigger: "change" }
        ],
        execStatus: [
          { required: true, message: "请选择执行状态", trigger: "change" }
        ],
        cron: [
          { required: true, message: "cron表达式不能为空", trigger: "blur" }
        ],
      },
      execStatus:'0',
    };
  },
  created() {
    this.getChannelList();
    this.getList();
  },
  methods: {
    /** 查询消息模板列表 */
    getList() {
      this.loading = true;
      listPushTemplate(this.queryParams).then(response => {
        let list = response.data.list;
        list.forEach(item=>{
          item.params = JSON.parse(item.params);
        })
        this.pushTemplateList = list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    /** 获取渠道列表 */
    getChannelList() {
      this.loading = true;
      listSimplePushChannel({}).then(response => {
        this.pushChannelList = response.data;
        this.loading = false;
      });
    },
    /** 渠道变更事件 */
    onChannelChange(val){
      getPushChannelTemplateParams(val).then(response => {
        this.form.params = response.data;
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
        code: null,
        channelId: null,
        params: null,
        cron: '0',
        msgType: '0',
        status: '0',
        remark: null,
      };
      this.execStatus = '0'
      this.resetForm("form");
    },
    cancelTest() {
      this.openTest = false;
      this.resetTestForm();
    },
    resetTestForm() {
      this.testForm = {
        id: null,
        params: null,
        templateParams: null
      };
      this.resetForm("testForm");
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
      this.title = "添加消息模板";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getPushTemplate(id).then(response => {
        this.form = response.data;
        this.execStatus='1'
        if (this.form.cron==='0'){
          this.execStatus='0'
        }
        this.open = true;
        this.title = "修改消息模板";
      });
    },
    handleTest(row) {
      this.resetTestForm();
      const id = row.id || this.ids
      getPushTemplate(id).then(response => {
        let params = response.data.params
        this.testForm.params = JSON.parse(params)
        let matches = params.match(/{(.*?)}/g);
        let tempParams = {};
        if (matches && matches.length>0){
          matches.forEach(m=>{
            tempParams[m.substring(1,m.length-1)] = undefined
          })
        }
        this.testForm.templateParams = tempParams
        this.testForm.id = response.data.id
        this.openTest = true;
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (this.execStatus === '0') {
          this.form.cron = '0';
        }
        if (valid) {
          if (this.form.id != null) {
            updatePushTemplate(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addPushTemplate(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 提交按钮 */
    submitTestForm() {
      this.$refs["testForm"].validate(valid => {
        if (valid) {
          testPushTemplate(this.testForm).then(response => {
            this.$modal.msgSuccess("测试成功");
          });
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = (row.id && [row.id]) || this.ids;
      this.$confirm('是否确认删除消息模板编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delPushTemplate(ids);
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
    },

    /** 导出按钮操作 */
    handleExport() {
      this.download('system/pushTemplate/export', {
        ...this.queryParams
      }, `pushTemplate.xlsx`)
    },
    /** cron表达式按钮操作 */
    handleShowCron() {
      this.expression = this.form.cron;
      this.openCron = true;
    },
    /** 确定后回传值 */
    crontabFill(value) {
      this.form.cron = value;
    },
  }
};
</script>
