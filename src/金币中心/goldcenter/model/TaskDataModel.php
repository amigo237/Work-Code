<?php
class TaskDataModel extends GoldCenterReleaseModel{

	protected $pk = 'taskid';

	public function updateTaskData($data=array(), $dayno=''){
		if(empty($data)) return false;
		$clean_sql = "DELETE FROM `task_data`";
		if(!empty($dayno)){
			$clean_sql = $clean_sql." WHERE dayno='".$dayno."'";
		}
		$this->execute($clean_sql);
		$keys = array(
			'taskid' => 's',
			'taskname' => 's',
			'dayno' => 's',
			'taskcoin' => 'i',
			'checkurl' => 's',
			'tasktype' => 'i',
			'remark' => 's',
			'step' => 's',
		);
		$sql = 'INSERT INTO `task_data` ';
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
