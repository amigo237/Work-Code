<?php
import('goldcenter.model.GoldCenterModel');
import('goldcenter.model.TaskBaseInfoModel');
import('goldcenter.model.TaskConfigDataModel');

class TaskController extends Controller{

	protected $is_admin;
	protected $username;
	protected $executor;

	const LUA_DIR = 'tasklua';

	protected function _initialize(){
		$login_info = unserialize(session_get(USER_STATE_FLAG));
		$this->executor = $login_info;
		$this->is_admin = $login_info['is_admin'];
		$this->username = $login_info['name'];
	}

	public function actionIndex(){
		$tasktype = array('1'=>array('name'=>'常规任务','color'=>'#009100'),'2'=>array('name'=>'特殊任务','color'=>'#CE0000'),'3'=>array('name'=>'活动任务','color'=>'#D9B300'));
		$model = new TaskConfigDataModel;
		$daytasks_info = $model->where(array('dayno'=>array('egt', date('Ymd'))))->order('dayno ASC')->select();
		$this->assign('daytasks_info', $daytasks_info);
		$this->assign('today', date('Ymd'));
		$this->assign('is_admin', $this->is_admin);
		$this->assign('tasktype',$tasktype);
		$this->display();
	}

	public function actionCreateDayTask(){
		$model = new TaskBaseInfoModel;
		$all_task_list = $model->order('seqid DESC')->select();
		$type_task_list = array();
		foreach($all_task_list as $row){
			$type = $row['tasktype'];
			if(!isset($type_task_list[$type])){
				$type_task_list[$type] = array();
			}
			$type_task_list[$type][$row['seqid']] = $row['taskname'].'[金币:'.$row['taskcoin'].']';
		}
		$result_code = 0;
		if(cookie_isset('result_code')){
			$result_code = cookie_get('result_code');
			cookie_del('result_code');
		}
		$this->assign('result_code', $result_code);
		$this->assign('activity_tasklist', $type_task_list[3]);
		$this->assign('special_tasklist', $type_task_list[2]);
		$this->assign('normal_tasklist', $type_task_list[1]);
		$this->display();
	}

	public function actionEditDayTask($dayno){
		$daytime = date('Y-m-d',strtotime($dayno));
		$model = new TaskConfigDataModel;
		$daytasks_info = $model->where(array('dayno'=>$dayno))->find();
		$seqidlist = array();
		if($daytasks_info){
			$tasklist = $daytasks_info['tasklist2'];
			foreach($tasklist as $row){
				$seqidlist[] = $row['originid'];
			}
			$model = new TaskBaseInfoModel;
			$all_task_list = $model->order('seqid DESC')->select();
			$type_task_list = array();
			foreach($all_task_list as $row){
				$type = $row['tasktype'];
				if(!isset($type_task_list[$type])){
					$type_task_list[$type] = array();
				}
				$type_task_list[$type][$row['seqid']] = $row['taskname'].'[金币:'.$row['taskcoin'].']';
			}
		}
		$result_code = 0;
		if(cookie_isset('result_code')){
			$result_code = cookie_get('result_code');
			cookie_del('result_code');
		}
		$this->assign('result_code', $result_code);
		$this->assign('seqidlist', $seqidlist);
		$this->assign('activity_taskinfo_list', $type_task_list[3]);
		$this->assign('special_taskinfo_list', $type_task_list[2]);
		$this->assign('normal_taskinfo_list', $type_task_list[1]);
		$this->assign('dayno', $dayno);
		$this->assign('daytime', $daytime);
		$this->display();
	}

	public function actionUpdate1($dayno, $tasklist){
		$result_code = 2;
		$model = new TaskConfigDataModel;
		if($model->where(array('dayno'=>$dayno))->delete()){
			$success = 0;
			$model = new TaskBaseInfoModel;
			$all_task_list = $model->order('seqid DESC')->select();
			$task_list = array();
			foreach($all_task_list as $row){
				if(in_array($row['seqid'], $tasklist)){
					$task_list[] = array(
						'taskid' => $dayno.str_pad($row['seqid'], 4, "0", STR_PAD_LEFT),
						'taskname' => $row['taskname'],
						'taskcoin' => $row['taskcoin'],
						'taskintro' => json_decode($row['taskintro']),
						'checkurl' => $row['checkurl'],
						'luaurl' => $row['luaurl'],
						'tasktype' => $row['tasktype'],
						'autoload' => $row['autoload'],
						'feedbackbtn' => $row['feedbackbtn'],
						'remark' => $row['remark'],
						'originid' => $row['seqid'],
					);
				}
			}
			$model = new TaskConfigDataModel;
			$model->dayno = $dayno;
			$model->tasklist = json_encode($task_list);
			$model->create_user = $this->username;
			$model->create_time = date('Y-m-d H:i:s');
			$model->publish_user = '';
			$model->publish_time = '';
			$model->status = 0;
			if($model->add()){
				$success = $success;
			}else{
				$success = $success + 1;
			}
		}
		if($success == 0){
			$result_code = 1;
		}else{
			$result_code = 3;
		}
		cookie_set('result_code', $result_code);
		$this->redirect("/index.php?r=goldcenter/task/editdaytask&dayno=$dayno");
	}

	public function actionCreate1($startdate, $enddate, $randnum, $tasklist=''){
		$starttime = strtotime($startdate);
		$endtime = strtotime($enddate);
		if($startdate < date('Y-m-d')){
			$result_code = 7;
		}else{
			if($starttime > $endtime){
				$result_code = 5;
			}else{
				$days = ($endtime - $starttime) / 86400;
				if($days > 7){
					$result_code = 6;
				}else{
					$result_code = 2;
					$model = new TaskConfigDataModel;
					$conf_count = $model->query("SELECT COUNT(`dayno`) AS daycount FROM task_config_data WHERE dayno>='".date('Ymd', $starttime)."' AND dayno<='".date('Ymd', $endtime)."'");
					$daycount = intval($conf_count[0]['daycount']);
					if($daycount != 0){
						$result_code = 4;
					}else{
						$success = 0;
						while($starttime <= $endtime){
							$model = new TaskBaseInfoModel;
							$dayno = date('Ymd', $starttime);
							$all_task_list = $model->order('seqid DESC')->select();
							$exclusion_list = array();
							$task_list = array();
							foreach($all_task_list as $row){
								if(in_array($row['seqid'], $tasklist)){
									$task_list[] = array(
										'taskid' => $dayno.str_pad($row['seqid'], 4, "0", STR_PAD_LEFT),
										'taskname' => $row['taskname'],
										'taskcoin' => $row['taskcoin'],
										'taskintro' => json_decode($row['taskintro']),
										'checkurl' => $row['checkurl'],
										'luaurl' => $row['luaurl'],
										'tasktype' => $row['tasktype'],
										'autoload' => $row['autoload'],
										'feedbackbtn' => $row['feedbackbtn'],
										'remark' => $row['remark'],
										'originid' => $row['seqid'],
									);
									$exclusion_list[] = $row['seqid'];
									if(!empty($row['exclusion'])){
										$exclusion_list =  array_merge($exclusion_list, explode(",",$row['exclusion']));
									}
								}
							}
							$normal_task_list = $model->where(array('tasktype'=>'1'))->order('seqid DESC')->select();
							$i = 0;
							$temp_task_list = $normal_task_list;
							$nodata = false;
							while($i < $randnum && !$nodata){
								$num = count($temp_task_list);
								if($num != 0){
									$rownum = rand(0, ($num-1));
									$rand_data = $temp_task_list[$rownum];
									if(!in_array($rand_data['seqid'], $exclusion_list)){
										$exclusion_list[] = $rand_data['seqid'];
										if(!empty($rand_data['exclusion'])){
											$exclusion_list = array_merge($exclusion_list, explode(",",$rand_data['exclusion']));
										}
										$task_list[] = array(
											'taskid' => $dayno.str_pad($rand_data['seqid'], 4, "0", STR_PAD_LEFT),
											'taskname' => $rand_data['taskname'],
											'taskcoin' => $rand_data['taskcoin'],
											'taskintro' => json_decode($rand_data['taskintro']),
											'checkurl' => $rand_data['checkurl'],
											'luaurl' => $rand_data['luaurl'],
											'tasktype' => $rand_data['tasktype'],
											'autoload' => $rand_data['autoload'],
											'feedbackbtn' => $rand_data['feedbackbtn'],
											'remark' => $rand_data['remark'],
											'originid' => $rand_data['seqid'],
										);
										$i = $i + 1;
									}
									$temp2_task_list = array();
									foreach($temp_task_list as $row){
										if(!in_array($row['seqid'], $exclusion_list)){
											$temp2_task_list[] = $row;
										}
									}
									$temp_task_list = $temp2_task_list;
								}else{
									$nodata = true;
								}
							}
							$model = new TaskConfigDataModel;
							$model->dayno = $dayno;
							$model->tasklist = json_encode($task_list);
							$model->create_user = $this->username;
							$model->create_time = date('Y-m-d H:i:s');
							$model->publish_user = '';
							$model->publish_time = '';
							$model->status = 0;
							if($model->add()){
								$success = $success;
							}else{
								$success = $success + 1;
							}
							$starttime = $starttime + 86400;
						}
						if($nodata == true){
							$result_code = 8;
						}else if($success == 0){
							$result_code = 1;
						}else{
							$result_code = 3;
						}
					}
				}
			}
		}
		cookie_set('result_code', $result_code);
		$this->redirect('/index.php?r=goldcenter/task/createdaytask');
	}

	public function actionDelete1($dayno){
		$model = new TaskConfigDataModel;
		if($model->delete($dayno)){
			ajax_return(1, '删除成功');
		}
		ajax_return(0, '删除失败');
	}

	public function actionTasklist($page_num=1){
		$title = array(
			'_id_' => 'seqid',
			'taskname' => array('name'=>'任务名称', 'width'=>'30%'),
			'taskcoin' => array('name'=>'奖励金币', 'width'=>'20%'),
			'tasktype' => array('name'=>'任务类型', 'width'=>'20%', 'trans'=>array(1=>'常规任务',2=>'特殊任务',3=>'活动任务')),
			'_action_' => array(
				'name' => '操作',
				'width'=>'30%',
				'menu' => array(
					array('name'=>'修改', 'click'=>'xbox_edittask', 'args'=>'seqid'),
					array('name'=>'删除', 'click'=>'xbox_deletetask', 'args'=>'seqid'),
				)
			)
		);
		$page_size = 8;
		$model = new TaskBaseInfoModel;
		$data = $model->getPageGameList($page_num, $page_size);
		$datagrid = DataGrid::display(array('title' => $title, 'data' => $data['data']));
		$this->assign('pagebar', $data['page']);
		$this->assign('datagrid', $datagrid);
		$this->display();
	}

	public function actionCreateTask(){
		$model = new TaskBaseInfoModel;
		$all_task_list = $model->order('seqid DESC')->select();
		$type_task_list = array();
		foreach($all_task_list as $row){
			$task_list[$row['seqid']] = $row['taskname'];
		}
		$result_code = 0;
		if(cookie_isset('result_code')){
			$result_code = cookie_get('result_code');
			cookie_del('result_code');
		}
		$this->assign('result_code', $result_code);
		$this->assign('task_list', $task_list);
		$this->display();
	}

	public function actionEditTask($seqid){
		$model = new TaskBaseInfoModel;
		$all_task_list = $model->order('seqid DESC')->select();
		foreach($all_task_list as $row){
			$task_list[$row['seqid']] = $row['taskname'];
		}
		$task_info = $model->where(array('seqid'=>$seqid))->find();
		$taskintro = $task_info['taskintro2'];
		$has_steps = isset($taskintro['steps']) ? 1 : 0;
		$has_downloadurl = isset($taskintro['downloadurl']) ? 1 : 0;
		$this->assign('has_steps', $has_steps);
		$this->assign('has_downloadurl', $has_downloadurl);
		$this->assign('task_info', $task_info);
		$this->assign('task_list', $task_list);
		$this->assign('exclusion_task_list', explode(",",$task_info['exclusion']));
		$this->assign('taskintro', $taskintro);
		$this->display();
	}

	public function actionTaskintroForm($tasksteps='', $downloadurl=''){
		$fields = array();
		$cn_steps = array(
			1 => '一',
			2 => '二',
			3 => '三',
			4 => '四',
			5 => '五',
			6 => '六',
			7 => '七',
			8 => '八',
			9 => '九',
		);
		$stepcount = intval($tasksteps);
		if($stepcount > 0){
			$fields[] = array('name' => 'stepcount', 'label' => '步骤总数：', 'type' => 'hidden', 'default' => $stepcount);
			for($i=1; $i<=$stepcount; $i++){
				$fields[] = array('name' => 'step'.$i, 'label' => '步骤'.$cn_steps[$i].'：', 'type' => 'text', 'maxlength' => '200');
			}
		}
		if(intval($downloadurl)>0){
			$fields[] = array('name' => 'downloadurl', 'label' => '下载链接：', 'type' => 'text', 'maxlength' => '200');
		}
		if(!empty($fields)){
			$config = array(
				'prefix' => 'xbox_taskintro_',
				'fields' => $fields,
			);
			$form = Form::render($config);
			ajax_return(1, '', array('taskintro_form' => $form));
		}
		ajax_return(0, '');
	}

	public function actionUpdate2($seqid){
		$retdata = array();
		$model = new TaskBaseInfoModel;
		$task_info = $model->where(array('seqid'=>$seqid))->find();
		$taskintro = $task_info['taskintro2'];
		if(isset($_POST['taskname'])){
			$model->taskname = $_POST['taskname'];
			$retdata['name'] = 'taskname';
			$retdata['value'] = $_POST['taskname'];
		}else if(isset($_POST['taskcoin'])){
			$model->taskcoin = $_POST['taskcoin'];
			$retdata['name'] = 'taskcoin';
			$retdata['value'] = $_POST['taskcoin'];
		}else if(isset($_POST['checkurl'])){
			$model->checkurl = $_POST['checkurl'];
			$retdata['name'] = 'checkurl';
			$retdata['value'] = $_POST['checkurl'];
		}else if(isset($_POST['tasktype'])){
			$model->tasktype = $_POST['tasktype'];
			$retdata['name'] = 'tasktype';
			$retdata['value'] = $_POST['tasktype'];
		}else if(isset($_POST['exclusion'])){
			$model->exclusion = $_POST['exclusion'];
			$retdata['name'] = 'exclusion';
			$retdata['value'] = $_POST['exclusion'];
		}else if(isset($_POST['luaurl'])){
			$luaurl = $_POST['luaurl'];
			$luafile = UPLOAD_PATH.$luaurl;
			if(is_file($luafile) && copy($luafile, DATA_PATH.'goldcenter/'.$luaurl)){
				$model->luaurl = GOLDCENTER_CONF_URL.$luaurl;
				$retdata['name'] = 'luaurl';
				$retdata['value'] = $luaurl;
			}else{
				ajax_return(0, 'Lua文件修改失败！');
			}
		}else if(isset($_POST['feedbackbtn'])){
			$model->feedbackbtn = $_POST['feedbackbtn'];
			$retdata['name'] = 'feedbackbtn';
			$retdata['value'] = $_POST['feedbackbtn'];
		}else if(isset($_POST['autoload'])){
			$model->autoload = $_POST['autoload'];
			$retdata['name'] = 'autoload';
			$retdata['value'] = $_POST['autoload'];
		}else if(isset($_POST['downloadurl'])){
			$taskintro['downloadurl'] = $_POST['downloadurl'];
			$retdata['name'] = 'downloadurl';
			$retdata['value'] = $_POST['downloadurl'];
		}else if(isset($_POST['description'])){
			$taskintro['description'] = $_POST['description'];
			$retdata['name'] = 'description';
			$retdata['value'] = $_POST['description'];
		}else{
			for($i = 0 ;$i < 9 ;$i++){
				$taskstep = 'taskstep'.$i;
				if(isset($_POST[$taskstep])){
					$taskintro['steps'][$i] = $_POST[$taskstep];
					$retdata['name'] = $taskstep;
					$retdata['value'] = $_POST[$taskstep];
				}
			}
		}
		$model->seqid = $seqid;
		$model->taskintro = json_encode($taskintro);
		if($model->save()){
			ajax_return(1, '修改成功！', $retdata);
		}
		ajax_return(0, '修改失败！');
	}

	public function actionCreate2($taskname, $taskcoin, $checkurl, $tasktype, $luaurl, $autoload, $feedbackbtn, $description, $exclusion=array(), $stepcount='1', $downloadurl=''){
		$result_code = 2;
		if(!empty($luaurl)){
			$luafile = UPLOAD_PATH.$luaurl;
			if(is_file($luafile) && copy($luafile, DATA_PATH.'goldcenter/'.$luaurl)){
				$taskintro = array();
				$model = new TaskBaseInfoModel;
				$model->taskname = $taskname;
				$model->taskcoin = $taskcoin;
				$model->checkurl = $checkurl;
				$model->tasktype = $tasktype;
				$model->luaurl = GOLDCENTER_CONF_URL.$luaurl;
				$model->autoload = $autoload;
				$model->feedbackbtn = $feedbackbtn;
				$model->exclusion = implode(",",$exclusion);
				$model->remark = '';
				$stepcount = intval($stepcount);
				if($stepcount > 1){
					$steps = array();
					for($i=1;$i < $stepcount+1;$i++){
						$step = "step".$i;
						$steps[] = $_POST[$step];
					}
					$taskintro['steps'] = $steps;
				}
				if(!empty($downloadurl)){
					$taskintro['downloadurl'] = $downloadurl;
				}
				if(!empty($description)){
					$taskintro['description'] = $description;
				}
				$model->taskintro = json_encode($taskintro);
				if($model->add()){
					$result_code = 1;
				}else{
					$result_code = 3;
				}
			}
		}
		cookie_set('result_code', $result_code);
		$this->redirect('/index.php?r=goldcenter/task/createtask');
	}

	public function actionTaskTips(){
		$result_code = 0;
		if(cookie_isset('result_code')){
			$result_code = cookie_get('result_code');
			cookie_del('result_code');
		}
		$generate_file = DATA_PATH.'goldcenter/tasktips.cfg';
		$tasktips_info = array(
			'task_remind_tips' => '2',
			'task_finish_tips' => '2',
			'how_long_pop' => '0',
			'finish_all_awards' => '0',
		);
		if(is_file($generate_file)){
			$content = file_get_contents($generate_file);
			$tasktips_info = json_decode($content, true);
		}
		$this->assign('tasktips_info', $tasktips_info);
		$this->assign('result_code', $result_code);
		$this->display();
	}

	public function actionCreateTaskTips($task_remind_tips, $task_finish_tips, $how_long_pop, $finish_all_awards){
		$value = array('task_remind_tips'=>$task_remind_tips, 'task_finish_tips'=>$task_finish_tips, 'how_long_pop'=>trim($how_long_pop), 'finish_all_awards'=>trim($finish_all_awards));
		$content = json_encode($value);
		$generate_file = DATA_PATH.'goldcenter/tasktips.cfg';
		if(file_put_contents($generate_file, $content) > 0){
			$result_code = 1;
		}else{
			$result_code = 2;
		}
		cookie_set('result_code', $result_code);
		$this->redirect('/index.php?r=goldcenter/task/tasktips');
	}

	public function actionDelete2($seqid){
		$model = new TaskBaseInfoModel;
		if($model->delete($seqid)){
			ajax_return(1, '删除成功');
		}
		ajax_return(0, '删除失败');
	}

	public function actionGenerate(){
		$model1 = new TaskBaseInfoModel;
		$map = $model1->dictMap();
		$model2 = new TaskConfigDataModel;
		$daytasks_info = $model2->where(array('dayno'=>array('egt', date('Ymd'))))->select();
		$tempResult = array();
		$success = 0;
		foreach($daytasks_info as $row){
			if(!empty($row['dayno'])){
				foreach($row['tasklist2'] as $v){
					$tempResult[$row['dayno']][$v['taskid']] = array(
						'taskname'=>$v['taskname'],
						'taskcoin'=>$v['taskcoin'],
						'tasktype'=> isset($v['tasktype']) ? $v['tasktype'] : $map[$v['originid']]['tasktype'],
						'taskintro'=>$v['taskintro'],
						'luaurl'=>$v['luaurl'],
						'autoload'=>$v['autoload'],
						'feedbackbtn'=>$v['feedbackbtn'],
					);
				}
			}
		}
		foreach($tempResult as $dayno => $task_info){
			$content = json_encode($task_info);
			$generate_path = DATA_PATH.'goldcenter/task/';
			$generate_name = $dayno.".cfg";
			if(!is_dir($generate_path)){
				mkdir($generate_path, 0755, true);
			}
			if(file_put_contents($generate_path.$generate_name, $content) > 0){
				$success = $success;
			}else{
				$success = $success + 1;
			}
		}
		if($success == 0){
			ajax_return(1,'任务生成成功');
		}else{
			ajax_return(0, '任务生成失败');
		}
	}
	
	public function actionGenerate2($dayno){
		$model1 = new TaskBaseInfoModel;
		$map = $model1->dictMap();
		$model2 = new TaskConfigDataModel;
		$daytasks_info = $model2->where(array('dayno'=>$dayno))->select();
		$tempResult = array();
		foreach($daytasks_info as $row){
			foreach($row['tasklist2'] as $v){
				$tempResult[$v['taskid']] = array(
					'taskname'=>$v['taskname'],
					'taskcoin'=>$v['taskcoin'],
					'tasktype'=> isset($v['tasktype']) ? $v['tasktype'] : $map[$v['originid']]['tasktype'],
					'taskintro'=>$v['taskintro'],
					'luaurl'=>$v['luaurl'],
					'autoload'=>$v['autoload'],
					'feedbackbtn'=>$v['feedbackbtn'],
				);
			}
		}
		$content = json_encode($tempResult);
		$generate_path = DATA_PATH.'goldcenter/task/';
		$generate_name = $dayno.".cfg";
		if(!is_dir($generate_path)){
			mkdir($generate_path, 0755, true);
		}
		if(file_put_contents($generate_path.$generate_name, $content) > 0){
			ajax_return(1,'任务生成成功');
		}else{
			ajax_return(0, '任务生成失败');
		}
	}
	
	private function getPublishData($tempdata){
		$model = new TaskBaseInfoModel;
		$map = $model->dictMap();
		$data = array();
		$returndata = array();
		foreach($tempdata as $value){
			foreach($value['tasklist2'] as $v){
				$data['taskid'] = $v['taskid'];				
				$data['taskname'] = $v['taskname'];
				$data['taskcoin'] = $v['taskcoin'];
				$data['checkurl'] = $v['checkurl'];
				$data['tasktype'] = isset($v['tasktype']) ? $v['tasktype'] : $map[$v['originid']]['tasktype'];
				$data['remark'] = $v['remark'];
				$data['dayno'] = $value['dayno'];
				$stepcount = 1;
				if(isset($v['taskintro']['steps'])){
					$stepcount = count($v['taskintro']['steps']);
				}
				$data['step'] = $stepcount;
				$returndata[] = $data;
			}
		}
		return $returndata;
	}

	public function actionPublishTaskTips(){
		$error_info = '发布失败：';
		@exec(PUBLISH_GOLDCENTER_SH.' tasktips', $output,$ret);
		if($ret == 0){
			ajax_return(1,'任务发布成功');
		}
		ajax_return(0, $error_info);
	}

	public function actionPublish(){
		import('goldcenter.model.GoldCenterReleaseModel');
		import('goldcenter.model.TaskDataModel');
		import('goldcenter.model.AllTaskListModel');
		$error_info = '发布失败：';
		@exec(PUBLISH_GOLDCENTER_SH.' task', $output,$ret);
		if($ret == 0){
			$model = new TaskConfigDataModel;
			$dayno = date('Ymd');
			$ts = date('Y-m-d H:i:s');
			$tempdata = $model->where(array('dayno'=>array('egt', $dayno)))->select();
			foreach($tempdata as $value){
				if($value['dayno'] > $dayno){
					$model->dayno = $value['dayno'];
					$model->publish_user = $this->username;
					$model->publish_time = $ts;
					$model->status = 1;
					if(!$model->save()){
						ajax_return(0,'任务发布失败');
					}
				}
			}
			$data = $this->getPublishData($tempdata);
			$model1 = new TaskDataModel;
			$model2 = new AllTaskListModel;
			if($model1->updateTaskData($data) && $model2->updateAllTaskList($data)){
				$result_info1 = HttpHelper::notify(GOLDCENTER_TASKSERVER_URL1, array('flag'=>"taskconf"));
				$result_info2 = HttpHelper::notify(GOLDCENTER_TASKSERVER_URL2, array('flag'=>"taskconf"));
				$result_info3 = HttpHelper::notify2(GOLDCENTER_UPDATE_REDIS_URL, array('apiname'=>'redis_update'));
				$result_info4 = HttpHelper::notify(GOLDCENTER_FLUSH_TASKDATA_URL1, array('flag'=>'task_flush'));
				$result_info5 = HttpHelper::notify(GOLDCENTER_FLUSH_TASKDATA_URL2, array('flag'=>'task_flush'));
				$error_info = $error_info.$result_info1['info'].', '.$result_info2['info'].', '.$result_info3['info'].', '.$result_info4['info'].', '.$result_info5['info'];
				if($result_info1['result'] == 1 && $result_info2['result'] == 1 && $result_info3['result'] == 1 && $result_info4['result'] == 1 && $result_info5['result'] == 1){
					ajax_return(1,'任务发布成功');
				}

			}
		}
		ajax_return(0, $error_info);
	}
	
	public function actionAdminPublish($dayno){
		if($dayno < date('Ymd')){
			ajax_return(0,'任务发布失败：无效过期任务！');
		}
		import('goldcenter.model.GoldCenterReleaseModel');
		import('goldcenter.model.TaskDataModel');
		import('goldcenter.model.AllTaskListModel');
		$error_info = '发布失败：';
		@exec(PUBLISH_GOLDCENTER_SH.' task', $output,$ret);
		if($ret == 0){
			$ts = date('Y-m-d H:i:s');
			$model = new TaskConfigDataModel;
			$tempdata = $model->where(array('dayno'=>$dayno))->select();
			foreach($tempdata as $value){
				$model->dayno = $value['dayno'];
				$model->publish_user = $this->username;
				$model->publish_time = $ts;
				$model->status = 1;
				if(!$model->save()){
					ajax_return(0, '任务发布失败:【dayno='.$value['dayno'].'】');
				}
			}
			$data = $this->getPublishData($tempdata);
			$model1 = new TaskDataModel;
			$model2 = new AllTaskListModel;
			if($model1->updateTaskData($data,$dayno) && $model2->updateAllTaskList($data,$dayno)){
				$result_info1 = HttpHelper::notify(GOLDCENTER_TASKSERVER_URL1, array('flag'=>"taskconf"));
				$result_info2 = HttpHelper::notify(GOLDCENTER_TASKSERVER_URL2, array('flag'=>"taskconf"));
				$result_info3 = HttpHelper::notify2(GOLDCENTER_UPDATE_REDIS_URL, array('apiname'=>'redis_update'));
                                $result_info4 = HttpHelper::notify(GOLDCENTER_FLUSH_TASKDATA_URL1, array('flag'=>'task_flush'));
                                $result_info5 = HttpHelper::notify(GOLDCENTER_FLUSH_TASKDATA_URL2, array('flag'=>'task_flush'));
                                $error_info = $error_info.$result_info1['info'].', '.$result_info2['info'].', '.$result_info3['info'].', '.$result_info4['info'].', '.$result_info5['info'];
                                if($result_info1['result'] == 1 && $result_info2['result'] == 1 && $result_info3['result'] == 1 && $result_info4['result'] == 1 && $result_info5['result'] == 1){
					ajax_return(1,'任务发布成功！');
				}

			}
		}
		ajax_return(0, $error_info);
	}

	public function actionUploadLua(){
		$savepath = UPLOAD_PATH.self::LUA_DIR.'/';
		$upload = new UploadFile();
		$upload->maxSize = 3292200;
		$upload->allowExts = array('lua');
		$upload->savePath = $savepath;
		$upload->uploadReplace = true;
		$upload->saveRule = get_image_basename();
		$upload->thumb = false;
		if(!$upload->upload()){
			ajax_return(0, $upload->getErrorMsg());
		}
		$upload_info = $upload->getUploadFileInfo();
		$luaurl = self::LUA_DIR.'/'.$upload_info[0]['savename'];
		ajax_return(1, 'LUA文件上传成功！', array('luaurl' => $luaurl));
	}
}
