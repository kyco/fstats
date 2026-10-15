import { Clear } from '@mui/icons-material'
import type { SelectProps } from '@mui/material'
import { Box, FormControl, FormHelperText, IconButton, InputLabel, MenuItem, Select } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { get } from 'lodash'
import type { ReactNode } from 'react'
import { Controller } from 'react-hook-form'
import type { Control, FieldValues, Path } from 'react-hook-form'

import type { SelectOptionWithType } from '@/types'
import { useIsMobile } from '@/hooks'
import { sxMenuItem } from '@/styles/styled'
import { logger } from '@/utils/Logger'
import { useTranslation } from '@/lib/i18n'

import SelectMenuItem from '../SelectMenuItem'
import { ui } from './styled'

type FormControlSelectProps<T extends FieldValues, P> = Omit<SelectProps, 'onChange'> & {
  name: Path<T>
  control: Control<T>
  options: SelectOptionWithType<P>[]
  renderInput?: (option: SelectOptionWithType<P>) => ReactNode
  renderOption?: ({
    option,
    selectedOption,
  }: {
    option: SelectOptionWithType<P>
    selectedOption?: SelectOptionWithType<P>
  }) => ReactNode
  onChange?: (value: string) => void
  onClear?: VoidFunction
  footer?: ReactNode
  maskData?: boolean
  startIcon?: ReactNode
}

const Component = <T extends FieldValues, P>({
  name,
  control,
  options,
  renderInput,
  renderOption,
  onChange,
  onClear,
  footer,
  maskData = false,
  startIcon,
  ...rest
}: FormControlSelectProps<T, P>) => {
  const { t } = useTranslation(['GLOBAL'])
  const theme = useTheme()
  const isMobile = useIsMobile()
  const sx = ui(theme, isMobile)

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, formState: { errors } }) => {
        const hasErrors = !!get(errors, name)
        const errorMsg = hasErrors ? (get(errors, name)?.message as string) : null
        const error = errorMsg ? (t(errorMsg) as string) : null
        const label = rest.required ? `${rest.label} *` : rest.label

        return (
          <FormControl disabled={rest.disabled} size={rest.size} fullWidth={rest.fullWidth} sx={{ maxWidth: '100%' }}>
            <InputLabel error={hasErrors}>
              {/* Also update Select.label when changing this */}
              {label}
            </InputLabel>

            <Select
              {...field}
              error={hasErrors}
              MenuProps={{
                slotProps: {
                  paper: {
                    elevation: 0,
                    sx: sx.menuPaper,
                  },
                },
              }}
              label={label} // Also update <InputLabel/> when changing this
              sx={{ backgroundColor: theme.vars.palette.background.default, ...rest.sx }}
              onPointerEnter={rest.onPointerEnter}
              onChange={(event) => {
                field.onChange(event)
                if (typeof onChange === 'function') {
                  onChange(event.target.value)
                }
              }}
              renderValue={(value) => {
                const selectedOption = options.find((option) => option.value === value)
                if (!selectedOption) {
                  logger('warn', '[Select]', 'No selected options for value:', value)
                  return ''
                }

                if (typeof renderInput === 'function') {
                  return renderInput(selectedOption)
                }

                return (
                  <Box sx={sx.value(typeof onClear === 'function')}>
                    {startIcon}
                    <span {...(maskData ? { 'data-notrack': true } : {})} style={sx.valueLabel}>
                      {selectedOption.label}
                    </span>
                  </Box>
                )
              }}
              endAdornment={
                typeof onClear === 'function' && field.value ? (
                  <IconButton onClick={onClear} sx={{ position: 'absolute', right: 32 }}>
                    <Clear fontSize="small" />
                  </IconButton>
                ) : null
              }
            >
              {options.map((option, index) => {
                const selectedOption = options.find((ioption) => ioption.value === field.value)
                if (typeof renderOption === 'function') {
                  return (
                    <MenuItem
                      key={`${option.label}-${option.value}`}
                      value={String(option.value)}
                      selected={option.value === selectedOption?.value}
                      sx={{ ...sxMenuItem(index === options.length - 1), display: 'block' }}
                    >
                      {renderOption({ option, selectedOption })}
                    </MenuItem>
                  )
                }

                return (
                  <MenuItem
                    key={`${option.label}-${option.value}`}
                    value={String(option.value)}
                    selected={option.value === selectedOption?.value}
                    sx={sxMenuItem(index === options.length - 1)}
                  >
                    <SelectMenuItem
                      option={option}
                      isSelected={option.value === selectedOption?.value}
                      maskData={maskData}
                    />
                  </MenuItem>
                )
              })}

              {footer || null}
            </Select>

            {hasErrors ? (
              <FormHelperText error sx={sx.error}>
                {error}
              </FormHelperText>
            ) : null}
          </FormControl>
        )
      }}
    />
  )
}

export default Component
