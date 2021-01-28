echo "Entity type: $1"
RED='\033[0;31m'
YEL='\033[1;33m'
GRE='\033[0;32m'
NC='\033[0m' # No Color
function redraw_progress_bar { # int barsize, int base, int i, int top
    local barsize=$1
    local base=$2
    local current=$3
    local top=$4        
    local j=0 
    local progress=$(( ($barsize * ( $current - $base )) / ($top - $base ) )) 
    echo -n "["
    for ((j=0; j < $progress; j++)) ; do echo -n '='; done
    echo -n '=>'
    for ((j=$progress; j < $barsize ; j++)) ; do echo -n ' '; done
    echo -n "] $(( $current )) / $top " $'\r'
}
declare -a emptyjsonarr
declare -a invalidjsonarr
declare -a validjsonarr
j=0
for i in $1/*.js
    do
    j=$((j+1))
    total=$(ls $1 | wc -l)
    redraw_progress_bar 50 0 $j $total
    export json_string=$(node $i)
    #echo $i
    if [ -z "$json_string" ]; then
        #echo "Empty JSON returned, check script"
        emptyjsonarr+=($i)
        else if jq -e . >/dev/null 2>&1 <<<"$json_string"; then
            validjsonarr+=($i)
            else invalidjsonarr+=($i)
        fi
    fi
done
echo $'\n'
echo -e "${GRE}Valid JSON:${NC}"
echo "${validjsonarr[*]}"
echo -e "${YEL}No JSON output (Missing console.log(r)):${NC}"
echo "${emptyjsonarr[*]}"
echo -e "${RED}Invalid JSON:${NC}"
echo "${invalidjsonarr[*]}"