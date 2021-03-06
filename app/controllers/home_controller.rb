class HomeController < ApplicationController
  def index
    @data = []
    @grouping = []
    return

    session = GoogleDrive.login(CONFIG['drive_username'], CONFIG['drive_password'])
    key = "0AsbUBK0-i61ZdEpGRFVMRk1DVGNyam5fTkdXVWU4bEE"

    data_sheet = session.spreadsheet_by_key(key).worksheets[0]
    grouping_sheet = session.spreadsheet_by_key(key).worksheets[1]
    key_date_sheet = session.spreadsheet_by_key(key).worksheets[2]

    @grouping = grouping_sheet.rows.drop(1).map  do |row|
      h = {}
      row.each_with_index do |val,col|
        key = grouping_sheet.rows[0][col]
        h[key] = val
      end
      h
    end

    @key_dates = key_date_sheet.rows.drop(1).map  do |row|
      h = {}
      row.each_with_index do |val,col|
        key = key_date_sheet.rows[0][col]
        h[key] = val
      end
      h
    end

    @data = data_sheet.rows.drop(1).map  do |row|
      h = {}
      row.each_with_index do |val,col|
        key = data_sheet.rows[0][col]
        ints = %w(eu_at coe_at eurozone_at schengen_at gdp)
        if ints.include? key
          h[key] = val.to_s.to_i
        else
          h[key] = val
        end
      end
      h
    end
  end
end
