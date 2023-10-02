import { Datagrid, FunctionField, TextInput, List, TextField, useGetManyReference, useListContext, useRecordContext } from 'react-admin';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';

const userFilters = [
    <TextInput source="pw_name" label="User Search" alwaysOn resettable InputProps={{
        endAdornment: <InputAdornment position="end"><IconButton><SearchIcon/></IconButton></InputAdornment>,
      }}/>,
];

function ComputeUsage() {

    const listContext = useListContext();
    const recordContext = useRecordContext();

    if (!recordContext) return <Typography component="span" variant="body2" textAlign="right">Loading...</Typography>;
    if ( listContext.isLoading ) return <Typography component="span" variant="body2" textAlign="right">Loading...</Typography>;

    const usersOnPage = listContext.data.map((x) => x.id)

    // I know this is wrong and I don't care. It means one call to the API per page
    // instead of one call per entry
    const { data, isLoading, error } = useGetManyReference(
        "compute_latest",
        {
            target: 'PartitionKey',
            id: '1',
            filter: {"project":usersOnPage},
            pagination: { page: 1, perPage: 999 },
        }
    )

    if (isLoading) return <Typography component="span" variant="body2" textAlign="right">Loading...</Typography>;
    if (error) return <Typography component="span" variant="body2" textAlign="right">Error...</Typography>;
    if (!data) return <Typography component="span" variant="body2" textAlign="right">0 SU</Typography>;
    

    var compute_usage = data.reduce(function(sum,i) {
        if ( i.project === recordContext.id ) {
            if ( i.user != "total" && i.user != "grant" ) {
                sum += Number(i.usage)
            }
        }
        return sum;
    }, 0.0);

    return <Typography component="span" variant="body2" textAlign="right">{Math.round(compute_usage*100)/100} SU</Typography>;

}

export const GroupList = () => {

    return (
    <List filters={userFilters}>
        <Datagrid rowClick="show" bulkActionButtons={false}>
            <TextField source="id" label="Group Name"/>
            <TextField source="gid" label="gid"/>
            <FunctionField label="Compute Usage" render={ComputeUsage}/>
        </Datagrid>
    </List>
    )
}