<?php
class AllTaskListModel extends GoldCenterReleaseModel{

	protected $pk = 'taskid';

	public function updateAllTaskList($data=array(), $dayno=""){
		if(empty($data)) return false;
		$clean_sql = "DELETE FROM `all_task_list`";
		if(empty($dayno)){
			$clean_sql = $clean_sql." WHERE dayno>='".date('Ymd')."'";
		}else{
			$clean_sql = $clean_sql." WHERE dayno='".$dayno."'";
		}
		$this->execute($clean_sql);
		$keys = array(
			'taskid' => 's',
			'taskname' => 's',
			'taskcoin' => 'i',
			'dayno' => 's',
			'tasktype' => 'i',
		);
		$sql = 'INSERT INTO `all_task_list` ';
		$sql .= ' ('.preg_replace('/([^,]+)/i', '`\\1`', implode(',', array_keys($keys))).') VALUES ';
		$sql_values = array();
		foreach($data as $row){
			$values = array();
			foreach($keys as $k => $t){
				if($t=='s'){
					$values[] = "'".$row[$k]."'";
				}else{
					$values[] = $row[$k];
				}
			}
			$sql_values[] = '('.implode(',', $values).')';
			if(count($sql_values) == 1000){
				$this->execute($sql.implode(',', $sql_values));
				$sql_values = array();
				$num = 0;
			}
		}
		if(!empty($sql_values)){
			$this->execute($sql.implode(',', $sql_values));
		}
		return true;
	}

}
